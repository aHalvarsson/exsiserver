var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.SECRET;
const JWT_REFRESH_SECRET = process.env.REFRESH_SECRET;

// Route to refresh JWT token
router.post('/', function(req, res, next) {
  const { token } = req.body;
  if (token == null) return res.sendStatus(401);
  
  jwt.verify(token, JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '15m' });
    res.json({ accessToken });
  });
});


module.exports = router;