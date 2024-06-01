const axios = require('axios');
const mailer = require('./mailer');

class sirLogsALot {
   constructor(settings) {
      this.label = settings?.label || 'PDF';
      this.codeEnv = 'Heroku backend';
      this._mailAlertLevels = new Set(['fatal']);
      this._consoleLogLevels = new Set([
         'debug',
         'info',
         'warn',
         'error',
         'fatal',
      ]);
      this._mailAlertLevels = new Set(['fatal']);
      this._collectionSaveLevels = new Set(['userCom', 'error', 'fatal']);
      this.logObject = {
         logs: [],
         userCom: [],
      };
      this.API_URL = 'https://www.exsicon.se/_functions';
      this.accessToken;
      this.refreshToken;
   }
   // Log an info message
   info(logObject) {
      this.middleman(logObject, 'info');
   }

   // Log a warning message
   warn(logObject) {
      this.middleman(logObject, 'warn');
   }

   // log an error message
   error(logObject) {
      this.middleman(logObject, 'error');
   }
   // Log a debug message
   debug(logObject) {
      this.middleman(logObject, 'debug');
   }

   fatal(logObject) {
      this.middleman(logObject, 'fatal');
   }

   userCom(logObject) {
      this.middleman(logObject, 'userCom');
   }

   middleman(logObject, level) {
      let {
         message = '',
         errorMsg = '',
         errorStack = '',
         company = '',
         store = '',
         metadata = '',
         codefile = '',
         codeFile = '',
         labels = [],
      } = logObject;
      if (codeFile) codefile = codeFile;
      this._createLogEntry(
         level,
         message,
         errorMsg,
         errorStack,
         company,
         store,
         metadata,
         codefile,
         labels
      );
   }

   async _createLogEntry(
      level,
      message,
      errorMsg,
      errorStack,
      company,
      store,
      metadata,
      codefile,
      labels
   ) {
      let entry = {
         level: level,
         timestamp: new Date().toISOString(),
         message: message,
         errorMsg: errorMsg,
         errorStack: errorStack,
         company: company,
         store: store,
         metadata:
            typeof metadata === 'string' ? metadata : JSON.stringify(metadata),
         label: `${this.label}, ${labels.join(', ')}`,
         codefile: codefile,
         codeEnv: this.codeEnv,
      };

      if (this._mailAlertLevels.has(level)) {
         const mailResult = await this._sendLogToEmail(entry);
         entry.mailSent = mailResult;
      }
      if (this._consoleLogLevels.has(level)) {
         this._logToConsole(entry);
      }

      if (this._collectionSaveLevels.has(level)) {
         const collection = level === 'userCom' ? 'userCom' : 'logs';
         this.logObject[collection].push(entry);
      }
   }

   async _sendLogToEmail(entry) {
      return await mailer(entry);
   }

   /**
    * Send log data array to the server after obtaining access token
    */
   async sendLogArray() {
      console.log('sendLogObject', this.logObject);
      if (
         this.logObject['logs'].length > 0 ||
         this.logObject['userCom'].length > 0
      ) {
         await this.getAccessToken();
         await this.makeAuthorizedRequest();
      } else {
         console.log('No logs to send!');
      }
   }

   /**
    * Asynchronously retrieves the access token from the API
    */
   async getAccessToken() {
      try {
         // Check if access token and refresh token are not already available
         if (!this.accessToken || !this.refreshToken) {
            const PDF_PASSWORD = process.env.PDF_ADMIN_POST;
            // Send a POST request to the API to login with admin credentials
            const response = await axios.post(`${this.API_URL}/login`, {
               username: 'admin',
               password: PDF_PASSWORD,
            });
            // Log the response data
            console.log('getAccessToken', response.data);

            // If response data is available, set the access token and refresh token
            if (response?.data) {
               this.accessToken = response.data.accessToken;
               this.refreshToken = response.data.refreshToken;
            } else {
               // Log a message if there is no response from the API
               console.log('No response from ExSicon API');
            }
         } else {
            // Log a message if access token and refresh token already exist
            console.log('Access token and refresh token already exist');
         }
      } catch (error) {
         // Log an error message if there is an error getting the access token
         console.error('Error getting access token:', error.response.data);
      }
   }

   /**
    * Asynchronously refreshes the access token
    */
   async refreshAccessToken() {
      try {
         // Log message indicating refreshToken
         console.log('refreshToken');
         const response = await axios.post(`${this.API_URL}/token`, {
            token: this.refreshToken,
         });
         // Log message indicating successful refresh of access token and the response data
         console.log('refreshAccessToken', response.data);
         this.accessToken = response.data.accessToken;
      } catch (error) {
         // Log error message and response data if there's an error refreshing the access token
         console.error('Error refreshing access token:', error.response.data);
         this.accessToken = null;
         this.refreshToken = null;
         // Attempt to get a new access token
         await this.getAccessToken();
      }
   }

   /**
    * Makes an authorized request to the API
    */
   async makeAuthorizedRequest(tries = 0) {
      try {
         // Log the start of the request
         console.log('makeAuthorizedRequest');
         // Make the POST request to create PDF logs
         const response = await axios.post(
            `${this.API_URL}/createPdfLogs`,
            this.logObject,
            {
               headers: {
                  Authorization: `Bearer ${this.accessToken}`,
                  'Content-Type': 'application/json',
               },
            }
         );
         // Log the response data
         console.log('response', response?.data);
         // If the response data length is greater than 0, clear the log array
         if (response?.data) {
            this.logObject = {
               logs: [],
               userCom: [],
            };
         } else {
            // Log a message if there is no response from the ExSicon API
            console.log('No response from ExSicon API');
         }
      } catch (error) {
         if (error.response.status === 401 || error.response.status === 403) {
            // Log a message if the access token is expired and attempt to refresh it
            console.log('Access Token expired. Refreshing token...');
            if (tries < 3) {
               tries++;
               await this.refreshAccessToken();
               // Log a message and retry the request with the new access token
               console.log('Retrying makeAuthorizedRequest...');
               // Retry the request with the new access token
               await this.makeAuthorizedRequest();
            } else {
               // Log an error if three attempts to get the ExSicon API failed
               logger.error({
                  message: 'Three attempts to get ExSicon API failed.',
                  metadata: error.response.data,
               });
            }
         } else {
            // Log an error if there is an error making the authorized request
            console.error(
               'Error making authorized request:',
               error.response.data
            );
         }
      }
   }
}

const logger = new sirLogsALot();
module.exports = logger;
