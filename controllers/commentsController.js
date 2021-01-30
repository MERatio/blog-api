const { body, validationResult } = require('express-validator');

// Lib
const beforeMiddlewares = require('../lib/beforeMiddlewares');

// Models
const Comment = require('../models/comment');
const Post = require('../models/post');

exports.index = [
	beforeMiddlewares.validMongooseObjectIdRouteParams({
		postId: 'Post not found',
	}),
	(req, res, next) => {
		Post.findOne({
			_id: req.params.postId,
			...(!req.user && { published: true }),
		}).exec((err, post) => {
			if (err) {
				next(err);
			} else if (post === null) {
				const err = new Error('Post not found');
				err.status = 404;
				next(err);
			} else {
				Comment.find({ post: req.params.postId }).exec((err, comments) => {
					if (err) {
						next(err);
					} else {
						res.json({
							user: req.user ? req.user.forPublic : false,
							comments,
						});
					}
				});
			}
		});
	},
];

exports.new = [
	beforeMiddlewares.jwtAuthenticated,
	beforeMiddlewares.validMongooseObjectIdRouteParams({
		postId: 'Post not found',
	}),
	(req, res, next) => {
		// Post should be published before commenting.
		Post.findOne({ _id: req.params.postId, published: true }).exec(
			(err, post) => {
				if (err) {
					next(err);
				} else if (post === null) {
					const err = new Error('Post not found');
					err.status = 404;
					next(err);
				} else {
					res.json({
						user: req.user.forPublic,
					});
				}
			}
		);
	},
];

exports.create = [
	beforeMiddlewares.validMongooseObjectIdRouteParams({
		postId: 'Post not found',
	}),
	// If admin is the one commenting user their username.
	(req, res, next) => {
		if (req.user) {
			req.body.username = req.user.username;
		}
		next();
	},
	// Post should be published before commenting.
	(req, res, next) => {
		Post.findOne({ _id: req.params.postId, published: true }).exec(
			(err, post) => {
				if (err) {
					next(err);
				} else if (post === null) {
					const err = new Error('Post not found');
					err.status = 404;
					next(err);
				} else {
					next();
				}
			}
		);
	},
	// Validate and sanitise fields.
	body('username')
		.trim()
		.isLength({ min: 1 })
		.withMessage('Username is required')
		.isLength({ max: 20 })
		.withMessage('Username is too long (maximum is 20 characters)')
		.escape(),
	body('body')
		.trim()
		.isLength({ min: 1 })
		.withMessage('Comment body is required')
		.isLength({ max: 200 })
		.withMessage('Comment body is too long (maximum is 200 characters)')
		.escape(),
	// Process request after validation and sanitization.
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// There are errors.
			res.json({
				user: req.user ? req.user.forPublic : false,
				comment: req.body,
				errors: errors.array(),
			});
		} else {
			// Data is valid.
			// Create a Comment object with escaped and trimmed data.
			const comment = new Comment({
				post: req.params.postId,
				username: req.body.username,
				body: req.body.body,
			});
			comment.save((err, comment) => {
				if (err) {
					next(err);
				} else {
					// Successful
					res.json({
						user: req.user ? req.user.forPublic : false,
						comment,
					});
				}
			});
		}
	},
];