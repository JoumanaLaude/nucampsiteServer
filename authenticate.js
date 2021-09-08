const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); 
// when we receive data and need to convert it to store
passport.deserializeUser(User.deserializeUser()); 
// when a user is verified, user data has to be grabbed from a session and added to the req object