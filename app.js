var createError = require('http-errors');
var express = require('express');
var path = require('path'); // core module built with nodejs
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
// the required function is returning another function as its return value, and we're calling that return func

// importing route files | from current working director > routes folder > file name
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');

// we use mongoose to manipulate (CRUD) our mongodb database
// without this middleware, our express application can't interect with our mongodb
const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/nucampsite';
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

// view engine setup
// this lets express know where your static files are for serving routes
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser('133-221-333-123-111')); | conflicts with express sessions since it has its own cookie implementation

app.use(session({
  name: 'session-id',
  secret: '133-221-333-123-111',
  saveUninitialized: false, // prevents empty sessions cookies
  resave: false, // won't continue to be resaved whenever a req is made for that session
  store: new FileStore() // saving to hard disk instead of application memory
}));

// lets users access auth so they can create account
app.use('/', indexRouter);
app.use('/users', usersRouter);

function auth(req, res, next) {
    console.log(req.session);

    if (!req.session.user) {
        const err = new Error('You are not authenticated!');
        err.status = 401;
        return next(err);
    } else {
        if (req.session.user === 'authenticated') {
            return next();
        } else {
            const err = new Error('You are not authenticated! >:(');
            err.status = 401;
            return next(err);
        }
    }
}

app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);

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
