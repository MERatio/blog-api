const passport = require('passport');
const jwt = require('jsonwebtoken');

// Lib
const beforeMiddlewares = require('../lib/beforeMiddlewares');

exports.new = [
	beforeMiddlewares.jwtUnauthenticated,
	(req, res, next) => {
		res.json({ user: false });
	},
];

exports.create = [
	beforeMiddlewares.jwtUnauthenticated,
	(req, res, next) => {
		passport.authenticate('local', { session: false }, (err, user, info) => {
			if (err) {
				next(err);
			} else if (!user) {
				const err = new Error(info.message);
				err.status = 404;
				next(err);
			} else {
				req.login(user, { session: false }, (err) => {
					if (err) {
						next(err);
					} else {
						/* 
						Username and password matched.
						Generate a signed json web token 
						with object containing the user id as its payload
					*/
						const jwtPayload = { userId: user._id };
						const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
							expiresIn: '7d',
						});
						res.json({ token, user: user });
					}
				});
			}
		})(req, res, next);
	},
];
