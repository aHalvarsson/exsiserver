var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');

const users = {
  admin: { password: process.env.ADMIN_PASSWORD }
};

const JWT_SECRET = process.env.SECRET;
const JWT_REFRESH_SECRET = process.env.REFRESH_SECRET;


// Route to authenticate and receive JWT token
router.post('/', function(req, res, next) {
  const { username, password } = req.body;
  const user = users[username];

  if (!user || user.password !== password) {
    return res.status(400).send('Invalid username or password');
  }

  const accessToken = jwt.sign({ username }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ username }, JWT_REFRESH_SECRET, { expiresIn: '1h' });
  
  res.json({ accessToken, refreshToken });
} );

module.exports = router;