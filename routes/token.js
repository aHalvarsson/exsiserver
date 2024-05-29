var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const logger = require('../lib/logger.js');

const JWT_SECRET = process.env.SECRET;
const JWT_REFRESH_SECRET = process.env.REFRESH_SECRET;

/**
 * Route to refresh JWT token
 * @param {object} req - The request object
 * @param {object} res - The response object
 * @param {function} next - The next function
 */
router.post('/', function (req, res, next) {
   try {
      // Log the request and metadata
      logger.info({
         message: 'POST /token called from ip: ' + req.ip,
         metadata: req.body,
         codeFile: 'token.js',
      });

      const { token } = req.body;
      if (token == null) return res.sendStatus(401);

      jwt.verify(token, JWT_REFRESH_SECRET, (err, user) => {
         if (err) return res.sendStatus(403);
         // Generate new access token and send it in the response
         const accessToken = jwt.sign({ username: user.username }, JWT_SECRET, {
            expiresIn: '15m',
         });
         res.json({ accessToken });
      });
   } catch (error) {
      // Log the error and send a 500 status response
      logger.error({
         message: 'POST /token error',
         metadata: error,
         codeFile: 'token.js',
      });
      if (!res.headersSent)
         res.status(500).send(
            'An error occurred while trying to refresh token.'
         );
   }
});

module.exports = router;
