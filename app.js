var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var jwt  = require( 'jsonwebtoken' );

var indexRouter = require('./routes/index');
var pdfRouter = require( './routes/pdf' );
var loginRouter = require( './routes/login' );
var tokenRouter = require( './routes/token' );

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Add this middleware function to log all incoming requests
app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.path}`);
  next();
});

// routes are here
app.use('/', indexRouter);
app.use( '/login', loginRouter );
app.use( '/token', tokenRouter );
app.use('/pdf', verifyToken, pdfRouter);
app.get('/pdfs/:filename', (req, res) => {
  res.sendFile(`./routes/tmp/${req.params.filename}`);
});
app.use('/images', express.static(path.join(__dirname, 'images')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next( createError( 404 ) );
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// Middleware to authenticate JWT tokens
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log('authHeader: ', authHeader);
  if (authHeader) {
    const token = authHeader.split(' ')[1];
console.log('token: ', token);
    jwt.verify(token, process.env.SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}


module.exports = app;
