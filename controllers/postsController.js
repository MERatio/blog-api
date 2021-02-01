const { body, validationResult } = require('express-validator');
const async = require('async');

// Lib
const beforeMiddlewares = require('../lib/beforeMiddlewares');

// Models
const Post = require('../models/post');
const Comment = require('../models/comment');

exports.index = [
	(req, res, next) => {
		async.waterfall(
			[
				(callback) => {
					if (req.user && req.user.admin) {
						Post.find(callback);
					} else {
						Post.find({ published: true }, callback);
					}
				},
				(posts, callback) => {
					if (req.user && req.user.admin) {
						Comment.find().exec((err, comments) => {
							if (err) {
								callback(err, null, null);
							} else {
								callback(null, { posts, comments });
							}
						});
					} else {
						const publishedPostsIds = posts.map(({ _id }) => _id);
						Comment.find({ post: { $in: publishedPostsIds } }).exec(
							(err, comments) => {
								if (err) {
									callback(err, null, null);
								} else {
									callback(null, { posts, comments });
								}
							}
						);
					}
				},
			],
			(err, results) => {
				if (err) {
					next(err);
				} else {
					res.json({
						user: req.user ? req.user.forPublic : false,
						posts: results.posts,
						comments: results.comments,
					});
				}
			}
		);
	},
];

exports.create = [
	beforeMiddlewares.admin,
	// Validate and sanitise fields.
	body('title')
		.trim()
		.isLength({ min: 1 })
		.withMessage('Title is required')
		.isLength({ max: 60 })
		.withMessage('Title is too long (maximum is 60 characters)')
		.escape(),
	body('body')
		.trim()
		.isLength({ min: 1 })
		.withMessage('Body is required')
		.isLength({ max: 1000 })
		.withMessage('Body is too long (maximum is 1000 characters)')
		.escape(),
	// Process request after validation and sanitization.
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// There are errors.
			res.json({
				user: req.user ? req.user.forPublic : false,
				post: req.body,
				errors: errors.array(),
			});
		} else {
			// Data is valid.
			// Create an Post object with escaped and trimmed data.
			const post = new Post({
				author: req.user._id,
				title: req.body.title,
				body: req.body.body,
				published: false,
			});
			post.save((err, post) => {
				if (err) {
					next(err);
				} else {
					// Successful
					res.json({
						user: req.user.forPublic,
						post,
					});
				}
			});
		}
	},
];

exports.show = [
	beforeMiddlewares.validMongooseObjectIdRouteParams(),
	(req, res, next) => {
		Post.findById(req.params.postId).exec((err, post) => {
			if (err) {
				next(err);
			} else if (post === null) {
				const err = new Error('Page not found');
				err.status = 404;
				next(err);
			} else if (!(req.user && req.user.admin) && !post.published) {
				const err = new Error('Unauthorized');
				err.status = 401;
				next(err);
			} else {
				Comment.find({ post: req.params.postId }).exec((err, comments) => {
					if (err) {
						next(err);
					} else {
						res.json({
							user: req.user ? req.user.forPublic : false,
							post,
							comments,
						});
					}
				});
			}
		});
	},
];

exports.edit = [
	beforeMiddlewares.admin,
	beforeMiddlewares.validMongooseObjectIdRouteParams(),
	(req, res, next) => {
		Post.findById(req.params.postId).exec((err, post) => {
			if (err) {
				next(err);
			} else if (post === null) {
				const err = new Error('Page not found');
				err.status = 404;
				next(err);
			} else {
				res.json({
					user: req.user.forPublic,
					post,
				});
			}
		});
	},
];

exports.update = [
	beforeMiddlewares.admin,
	beforeMiddlewares.validMongooseObjectIdRouteParams(),
	// Validate and sanitise fields.
	body('title')
		.trim()
		.isLength({ min: 1 })
		.withMessage('Title is required')
		.isLength({ max: 60 })
		.withMessage('Title is too long (maximum is 60 characters)')
		.escape(),
	body('body')
		.trim()
		.isLength({ min: 1 })
		.withMessage('Body is required')
		.isLength({ max: 1000 })
		.withMessage('Body is too long (maximum is 1000 characters)')
		.escape(),
	body('published')
		.isBoolean()
		.withMessage('Published field should be a boolean'),
	// Process request after validation and sanitization.
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// There are errors.
			res.json({
				user: req.user.forPublic,
				post: req.body,
				errors: errors.array(),
			});
		} else {
			// Data is valid.
			// Create a Post object with escaped and trimmed data and old id.
			const post = new Post({
				author: req.user._id,
				title: req.body.title,
				body: req.body.body,
				published: req.body.published,
				_id: req.params.postId, // This is required, or a new ID will be assigned!
			});
			// Update the record.
			Post.findByIdAndUpdate(req.params.postId, post, {
				new: true,
				runValidators: true,
			}).exec((err, updatedPost) => {
				if (err) {
					next(err);
				} else if (updatedPost === null) {
					const err = new Error('Page not found');
					err.status = 404;
					next(err);
				} else {
					res.json({
						user: req.user.forPublic,
						post: updatedPost,
					});
				}
			});
		}
	},
];

exports.destroy = [
	beforeMiddlewares.admin,
	beforeMiddlewares.validMongooseObjectIdRouteParams(),
	(req, res, next) => {
		Post.findByIdAndDelete(req.params.postId, (err, post) => {
			if (err) {
				next(err);
			} else if (post === null) {
				const err = new Error('Page not found');
				err.status = 404;
				next(err);
			} else {
				Comment.deleteMany({ post: post._id }, (err) => {
					if (err) {
						next(err);
					} else {
						res.json({
							user: req.user.forPublic,
							post,
						});
					}
				});
			}
		});
	},
];
