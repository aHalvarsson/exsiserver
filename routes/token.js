var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const logger = require( '../lib/logger.js' );


const JWT_SECRET = process.env.SECRET;
const JWT_REFRESH_SECRET = process.env.REFRESH_SECRET;

// Route to refresh JWT token
router.post('/', function(req, res, next) {
  try {
  logger.info({
    message: 'POST /token called from ip: ' + req.ip,
    metadata: req.body,
    codeFile: 'token.js',
  });

  const { token } = req.body;
  if (token == null) return res.sendStatus(401);
  
  jwt.verify(token, JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '15m' });
    res.json({ accessToken });
  });
} catch (error) {
  logger.error({
    message: 'POST /token error',
    metadata: error,
    codeFile: 'token.js',
  });
  if (!res.headersSent) res.status(500).send('An error occurred while trying to refresh token.');
}
});


module.exports = router;