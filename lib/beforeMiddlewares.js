const ObjectId = require('mongoose').Types.ObjectId;
const passport = require('passport');

exports.validMongooseObjectIdParams = (paramNamesAndMsgs) => {
	return (req, res, next) => {
		const errors = [];
		for (const paramName in paramNamesAndMsgs) {
			if (paramNamesAndMsgs.hasOwnProperty(paramName)) {
				if (!ObjectId.isValid(req.params[paramName])) {
					errors.push({ msg: paramNamesAndMsgs[paramName] });
				}
			}
		}
		if (errors.length > 0) {
			res.status(404).json({
				user: req.user ? req.user.forPublic : false,
				errors,
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
