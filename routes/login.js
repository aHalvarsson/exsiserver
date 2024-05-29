var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const logger = require('../lib/logger.js');

// Define the users and their passwords
const users = {
   admin: { password: process.env.ADMIN_PASSWORD },
};

// Get the JWT secrets from environment variables
const JWT_SECRET = process.env.SECRET;
const JWT_REFRESH_SECRET = process.env.REFRESH_SECRET;

// Route to authenticate and receive JWT token
router.post('/', function (req, res, next) {
   try {
      // Log the information about the login request
      logger.info({
         message: 'POST /login called from ip: ' + req.ip,
         metadata: req.body,
         codeFile: 'login.js',
      });

      // Get the username and password from the request body
      const { username, password } = req.body;
      const user = users[username];

      // Check if the user exists and the password is correct
      if (!user || user.password !== password) {
         return res.status(400).send('Invalid username or password');
      }

      // Create JWT tokens for access and refresh
      const accessToken = jwt.sign({ username }, JWT_SECRET, {
         expiresIn: '15m',
      });
      const refreshToken = jwt.sign({ username }, JWT_REFRESH_SECRET, {
         expiresIn: '1h',
      });

      // Send the tokens as JSON response
      res.json({ accessToken, refreshToken });
   } catch (error) {
      // Log the error if any occurred during login
      logger.error({
         message: 'Error logging in: ' + error.message,
         metadata: error.stack,
         codeFile: 'login.js',
      });

      // Send a 500 error response if the error occurred before sending headers
      if (!res.headersSent)
         res.status(500).send('An error occurred while trying to log in.');
   }
});

module.exports = router;
