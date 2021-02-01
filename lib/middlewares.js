const passport = require('passport');

exports.setUserUsingJwtAuth = (req, res, next) => {
	passport.authenticate('jwt', { session: false }, (err, user) => {
		if (err) {
			return next(err);
		} else if (user) {
			req.user = user;
		}
		next();
	})(req, res, next);
};
