var createError = require('http-errors');
var express = require('express');

var path = require('path'); // core module built with nodejs
var logger = require('morgan');
const passport = require('passport');
const config = require('./config'); // replaced authentication

// importing route files | from current working director > routes folder > file name
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');
const uploadRouter = require('./routes/uploadRouter');

// we use mongoose to manipulate (CRUD) our mongodb database
// without this middleware, our express application can't interect with our mongodb
const mongoose = require('mongoose');

const url = config.mongoUrl; // mongoUrl we set up in config.js
const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

connect.then(() => console.log('Connected correctly to server'),
  err => console.log(err) // another way to catch errors if you don't plan to chain anything after
);

var app = express();

// Secure traffic only
app.all('*', (req, res, next) => { // * wildcard that catches every request / like css *
  if (req.secure) { // check if https
    return next();
  } else {
      console.log(`Redirecting to: https://${req.hostname}:${app.get('secPort')}${req.url}`);
      res.redirect(301, `https://${req.hostname}:${app.get('secPort')}${req.url}`);
  }
});

// view engine setup
// this lets express know where your static files are for serving routes
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser('133-221-333-123-111')); | conflicts with express sessions since it has its own cookie implementation

//checking if there's an existing session for client, if so session data is loaded
app.use(passport.initialize());

// lets users access auth so they can create account
app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);
app.use('/imageUpload', uploadRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
