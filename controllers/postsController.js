const { body, validationResult } = require('express-validator');

// Lib
const beforeMiddlewares = require('../lib/beforeMiddlewares');

// Models
const Post = require('../models/post');
const Comment = require('../models/comment');

exports.index = (req, res, next) => {
	Post.find(req.user && req.user.admin ? {} : { published: true })
		.sort('-createdAt')
		.populate('author')
		.exec((err, posts) => {
			if (err) {
				next(err);
			} else {
				res.json({
					user: req.user ? req.user : false,
					posts,
				});
			}
		});
};

exports.new = [
	beforeMiddlewares.admin,
	(req, res, next) => {
		res.json({
			user: req.user,
		});
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
	body('published')
		.notEmpty()
		.withMessage('Published is required')
		.isIn([true, false])
		.withMessage('Published should be a boolean'),
	// Process request after validation and sanitization.
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// There are errors.
			res.json({
				user: req.user ? req.user : false,
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
				published: req.body.published,
			});
			post.save((err, post) => {
				if (err) {
					next(err);
				} else {
					// Successful
					res.json({
						user: req.user,
						post,
					});
				}
			});
		}
	},
];

exports.show = [
	beforeMiddlewares.validMongooseObjectIdRouteParams,
	(req, res, next) => {
		Post.findById(req.params.postId)
			.populate('author')
			.exec((err, post) => {
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
					res.json({
						user: req.user ? req.user : false,
						post,
					});
				}
			});
	},
];

exports.edit = [
	beforeMiddlewares.admin,
	beforeMiddlewares.validMongooseObjectIdRouteParams,
	(req, res, next) => {
		Post.findById(req.params.postId)
			.populate('author')
			.exec((err, post) => {
				if (err) {
					next(err);
				} else if (post === null) {
					const err = new Error('Page not found');
					err.status = 404;
					next(err);
				} else {
					res.json({
						user: req.user,
						post,
					});
				}
			});
	},
];

exports.update = [
	beforeMiddlewares.admin,
	beforeMiddlewares.validMongooseObjectIdRouteParams,
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
				user: req.user,
				post: req.body,
				errors: errors.array(),
			});
		} else {
			// Data is valid.
			// Update the record with escaped and trimmed data.
			Post.findByIdAndUpdate(
				req.params.postId,
				{
					title: req.body.title,
					body: req.body.body,
					published: req.body.published,
				},
				{
					new: true,
					runValidators: true,
				}
			)
				.populate('author')
				.exec((err, updatedPost) => {
					if (err) {
						next(err);
					} else if (updatedPost === null) {
						const err = new Error('Page not found');
						err.status = 404;
						next(err);
					} else {
						res.json({
							user: req.user,
							post: updatedPost,
						});
					}
				});
		}
	},
];

exports.destroy = [
	beforeMiddlewares.admin,
	beforeMiddlewares.validMongooseObjectIdRouteParams,
	(req, res, next) => {
		Post.findByIdAndDelete(req.params.postId)
			.populate('author')
			.exec((err, post) => {
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
								user: req.user,
								post,
							});
						}
					});
				}
			});
	},
];
