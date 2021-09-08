const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const config = require('./config.js');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); 
// when we receive data and need to convert it to store
passport.deserializeUser(User.deserializeUser()); 
// when a user is verified, user data has to be grabbed from a session and added to the req object

exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, {expiresIn: 3600}); 
                        // secretKey from conflict model | expires in an hour
};

const opts = {}; // will contain the options for the jwt strategy
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); 
                                // choosing to send token in an auth header & as a bearer token
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
    new JwtStrategy( // jwt constructor | first arg: options, second arg: verify arg
        opts,
        (jwt_payload, done) => { // verify callback function
            console.log('JWT payload:', jwt_payload);
            User.findOne({_id: jwt_payload._id}, (err, user) => { // finding user with same id as the token
                if (err) {
                    return done(err, false);
                } else if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            });
        }
    )
);

exports.verifyUser = passport.authenticate('jwt', {session: false});
// verifies incoming req is from a verified user | exports.verifyUser makes this a shortcut