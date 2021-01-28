const ObjectId = require('mongoose').Types.ObjectId;
const passport = require('passport');

exports.validMongooseObjectIdParams = (req, res, next) => {
	if (!ObjectId.isValid(req.params.id)) {
		res.status(404).json({
			errors: [{ msg: 'Post not found' }],
		});
	} else {
		next();
	}
};

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
