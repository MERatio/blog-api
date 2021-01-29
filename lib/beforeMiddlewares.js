const ObjectId = require('mongoose').Types.ObjectId;
const passport = require('passport');

exports.validMongooseObjectIdParams = (msg) => {
	return (req, res, next) => {
		if (!ObjectId.isValid(req.params.id)) {
			res.status(404).json({
				user: req.user ? req.user.forPublic : false,
				errors: [{ msg }],
			});
		} else {
			next();
		}
	};
};

exports.setUserUsingJwtAuth = (req, res, next) => {
	passport.authenticate('jwt', { session: false }, (err, user) => {
		if (err) {
			res.status(500).json({
				user: false,
				errors: [{ msg: 'Something went wrong, please try again later' }],
			});
		} else if (!user) {
			next();
		} else {
			req.user = user;
			next();
		}
	})(req, res, next);
};

exports.jwtAuthenticated = (req, res, next) => {
	if (!req.user) {
		res.status(401).json({
			user: false,
			messages: { warning: ['You may not proceed without being signed in'] },
		});
	} else {
		next();
	}
};
