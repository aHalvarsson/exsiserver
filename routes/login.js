var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const logger = require( '../lib/logger.js' );

const users = {
  admin: { password: process.env.ADMIN_PASSWORD }
};

const JWT_SECRET = process.env.SECRET;
const JWT_REFRESH_SECRET = process.env.REFRESH_SECRET;


// Route to authenticate and receive JWT token
router.post('/', function(req, res, next) {
  try {
  logger.info({
    message: 'POST /login called from ip: ' + req.ip,
    metadata: req.body,
    codeFile: 'login.js',
  })
  const { username, password } = req.body;
  const user = users[username];

  if (!user || user.password !== password) {
    return res.status(400).send('Invalid username or password');
  }

  const accessToken = jwt.sign({ username }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ username }, JWT_REFRESH_SECRET, { expiresIn: '1h' });
  
  res.json({ accessToken, refreshToken });
} catch (error) {
  logger.error({
    message: 'Error logging in: ' + error.message,
    metadata: error.stack,
    codeFile: 'login.js',
  });
  if (!res.headersSent) res.status(500).send('An error occurred while trying to log in.');
}
} );

module.exports = router;