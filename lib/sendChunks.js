const axios = require('axios');
const logger = require('./logger');

class sirSendsALot {
  constructor() {
    this.API_URL = 'https://www.exsicon.se/_functions';
    this.accessToken;
    this.refreshToken;
  }
  async sendPdfUrls(pdfUrls) {
    console.log('sendPdfUrls: ', JSON.stringify(pdfUrls, null, 2));
    await this.getAccessToken();
    await this.makeAuthorizedRequest(pdfUrls);
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
  async makeAuthorizedRequest(pdfUrls, tries = 0) {
    try {
      // Log the start of the request
      console.log('makeAuthorizedRequest');
      // Make the POST request to create PDF logs
      await axios.post(`${this.API_URL}/insertPDFs`, pdfUrls, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      /*
         // Log the response data
         console.log('response', response?.data);

         if (response?.data) {
            return true;
         } else {
            // Log a message if there is no response from the ExSicon API
            console.log('No response from ExSicon API');
            return false;
         }
         */
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
          JSON.stringify(error.response.data)
        );
      }
    }
  }
}

const sender = new sirSendsALot();
module.exports = sender;
