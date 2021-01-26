const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const User = require('../models/user');

// The strategy is called when passport.authenticate('local', ...) is called.
passport.use(
	new LocalStrategy((username, password, done) => {
		User.findOne({ username }, (err, user) => {
			if (err) {
				done(err);
			} else if (!user) {
				done(null, false, { message: 'Incorrect username' });
			} else {
				bcrypt.compare(password, user.password, (err, res) => {
					if (res) {
						// Passwords match! log user in
						done(null, user);
					} else {
						// Passwords do not match!
						done(null, false, { message: 'Incorrect password' });
					}
				});
			}
		});
	})
);

// The strategy is called when passport.authenticate('jwt', ...) is called.
passport.use(
	new JWTStrategy(
		{
			jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env.JWT_SECRET,
		},
		(jwtPayload, done) => {
			User.findById(jwtPayload.userId, (err, user) => {
				err ? done(err) : done(null, user);
			});
		}
	)
);

module.exports = passport;
