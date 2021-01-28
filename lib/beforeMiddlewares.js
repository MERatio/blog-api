const passport = require('passport');

exports.optionalJwtAuth = (req, res, next) => {
	passport.authenticate('jwt', { session: false }, (err, user) => {
		if (err) {
			res.status(500).json({
				errors: [{ msg: 'Something went wrong, please try again later' }],
			});
		} else {
			req.user = user;
		}
		next();
	})(req, res, next);
};
