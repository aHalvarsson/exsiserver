const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const moment = require('moment');
const axios = require('axios');

class sirLogsALot {
   constructor(settings) {
      this.label = settings?.label || 'PDF';
      this.codeEnv = 'Heroku backend';
      this.logArray = [];
      this.API_URL = 'https://www.exsicon.se/_functions/';
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
         metadata = '',
         codefile = '',
         codeFile = '',
         labels = [],
      } = logObject;
      if (codeFile) codefile = codeFile;
      this.createLogEntry(level, message, metadata, codefile, labels);
   }

   createLogEntry(level, message, metadata, codefile, labels) {
      try {
         let entry = {
            level: level,
            timestamp: new Date().toISOString(),
            message: message,
            metadata:
               typeof metadata === 'string'
                  ? metadata
                  : JSON.stringify(metadata),
            label: `${this.label}, ${Array.isArray(labels) ? labels.join(', ') : labels}`,
            codefile: codefile,
            codeEnv: this.codeEnv,
         };

         console.log(
            `Logger: ${entry.level.charAt(0).toUpperCase() + entry.level.slice(1)} - Labels: ${entry.label} - Message: ${
               entry.message
            }, Metadata: ${entry.metadata}, codefile: ${entry.codefile}, Timestamp: ${entry.timestamp}`
         );
         if (level === 'fatal' || level === 'error') {
            this.logArray.push(entry);
         }
      } catch (err) {
         console.log('Error in logger - _createLogEntry: ', err);
      }
   }

   // Function to generate a filename based on the current date
   generateFilename() {
      const date = moment().format('YYYY-MM-DD');
      return this.filenamePattern.replace('%DATE%', date);
   }

   // Function to create a write stream for logging
   // Parameters:
   // - filename: string representing the filename
   // Returns a write stream for the specified filename
   createWriteStream(filename) {
      const dir = path.join(__dirname, 'logs');
      if (!fs.existsSync(dir)) {
         fs.mkdirSync(dir);
      }
      const fullPath = path.join(dir, filename);
      const stream = fs.createWriteStream(fullPath, { flags: 'a' });

      // Event listener for error handling
      stream.on('error', (err) => {
         console.error('Error writing to log file:', err);
      });

      return stream;
   }

   // Function to check the size of the log file and rotate if necessary
   checkSizeAndRotate() {
      try {
         const thisDir = path.join(__dirname, 'logs', this.currentLog);
         if (fs.existsSync(thisDir)) {
            const stats = fs.statSync(thisDir);
            if (
               stats.size >= this.maxSize ||
               moment().diff(this.logStream.startTime, this.timeInterval) > 0
            ) {
               this.rotateLog();
            }
         }
         this.checkSizeInterval = setTimeout(
            this.checkSizeAndRotate.bind(this),
            21600000
         );
      } catch (err) {
         console.log('Error in logger - checkSizeAndRotate: ', err);
      }
   }

   /**
    * Rotate log file, compress old log, delete old logs, and create a new log file
    */
   rotateLog() {
      try {
         // Close the current log stream
         this.logStream.stream.end();
         // Compress old log file if zipOldFiles is true
         if (this.zipOldFiles) {
            const oldLog = this.currentLog;
            const gzip = zlib.createGzip();
            const inp = fs.createReadStream(oldLog);
            const out = fs.createWriteStream(`${oldLog}.gz`);
            inp.pipe(gzip)
               .pipe(out)
               .on('finish', () => fs.unlinkSync(oldLog));
         }
         // Delete old log files
         this.deleteOldLogs();
         // Generate a new log file and open a new log stream
         this.currentLog = this.generateFilename();
         this.logStream = {
            stream: this.createWriteStream(this.currentLog),
            startTime: moment(),
         };
      } catch (err) {
         console.log('Error in logger - rotateLog: ', err);
      }
   }

   /**
    * Delete old log files based on the maximum number of log files allowed
    */
   deleteOldLogs() {
      try {
         const files = fs
            .readdirSync(path.join(__dirname, 'logs'))
            .filter((file) => file.startsWith('log-'))
            .sort()
            .reverse();
         while (files.length >= this.maxFiles) {
            const fileToDelete = files.pop();
            fs.unlinkSync(path.join(__dirname, 'logs', fileToDelete));
         }
      } catch (err) {
         console.log('Error in logger - deleteOldLogs: ', err);
      }
   }

   /**
    * Save log entry to the log file
    * @param {Object} entry - Log entry object
    */
   saveLogToFile(entry) {
      this.logStream.stream.write(
         `${entry.timestamp} - Logger: ${entry.level.charAt(0).toUpperCase() + entry.level.slice(1)} - Message: ${
            entry.message
         }.\nMetadata: ${entry.metadata}, codefile: ${entry.codefile}, Labels: ${entry.label}\n\n`
      );
   }

   /**
    * Send log data array to the server after obtaining access token
    */
   async sendLogArray() {
      console.log('sendLogArray', this.logArray.length);
      await this.getAccessToken();
      await this.makeAuthorizedRequest();
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
            this.logArray,
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
            this.logArray = [];
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
