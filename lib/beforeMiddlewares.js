const ObjectId = require('mongoose').Types.ObjectId;
const passport = require('passport');

exports.validMongooseObjectIdRouteParams = () => {
	return (req, res, next) => {
		for (const paramName in req.params) {
			if (req.params.hasOwnProperty(paramName)) {
				if (!ObjectId.isValid(req.params[paramName])) {
					const err = new Error('Page not found');
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

exports.jwtUnauthenticated = (req, res, next) => {
	if (req.user) {
		const err = new Error("You're already signed in");
		err.status = 403;
		next(err);
	} else {
		next();
	}
};

exports.admin = (req, res, next) => {
	if (!req.user || !req.user.admin) {
		const err = new Error('Unauthorized');
		err.status = 401;
		next(err);
	} else {
		next();
	}
};
