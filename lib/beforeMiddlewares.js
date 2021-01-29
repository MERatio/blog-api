const ObjectId = require('mongoose').Types.ObjectId;
const passport = require('passport');

exports.validMongooseObjectIdRouteParams = (paramNamesAndMsgs) => {
	return (req, res, next) => {
		for (const paramName in paramNamesAndMsgs) {
			if (paramNamesAndMsgs.hasOwnProperty(paramName)) {
				if (!ObjectId.isValid(req.params[paramName])) {
					const err = new Error(paramNamesAndMsgs[paramName]);
					err.status = 404;
					return next(err);
				}
			}
		}
		next();
	};
};

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

exports.jwtAuthenticated = (req, res, next) => {
	if (!req.user) {
		const err = new Error('You may not proceed without being signed in');
		err.status = 401;
		next(err);
	} else {
		next();
	}
};
