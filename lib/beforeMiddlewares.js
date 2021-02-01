const ObjectId = require('mongoose').Types.ObjectId;

// Model
const Post = require('../models/post');

exports.validMongooseObjectIdRouteParams = (req, res, next) => {
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

exports.nonAdmin = (req, res, next) => {
	if (req.user && req.user.admin) {
		const err = new Error("You're already an admin");
		err.status = 403;
		next(err);
	} else {
		next();
	}
};

exports.publishedPost = (req, res, next) => {
	Post.findOne({ _id: req.params.postId, published: true }).exec(
		(err, post) => {
			if (err) {
				next(err);
			} else if (post === null) {
				const err = new Error('Page not found');
				err.status = 404;
				next(err);
			} else {
				next();
			}
		}
	);
};
