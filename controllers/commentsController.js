const { body, validationResult } = require('express-validator');

// Lib
const beforeMiddlewares = require('../lib/beforeMiddlewares');

// Models
const Comment = require('../models/comment');
const Post = require('../models/post');

exports.index = [
	beforeMiddlewares.validMongooseObjectIdRouteParams,
	(req, res, next) => {
		Post.findById(req.params.postId).exec((err, post) => {
			if (err) {
				next(err);
			} else if (post === null) {
				const err = new Error('Page not found');
				err.status = 404;
				next(err);
			} else if (!(req.user && req.user.admin) && !post.published) {
				/* Admin can get published or unpublished post
					 Non-admin user can only see published post
				*/
				const err = new Error('Unauthorized');
				err.status = 401;
				next(err);
			} else {
				Comment.find({ post: req.params.postId })
					.sort('-createdAt')
					.populate('author post')
					.exec((err, comments) => {
						if (err) {
							next(err);
						} else {
							res.json({
								user: req.user ? req.user : false,
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
	beforeMiddlewares.validMongooseObjectIdRouteParams,
	beforeMiddlewares.publishedPost,
	(req, res, next) => {
		res.json({
			user: req.user,
		});
	},
];

exports.create = [
	beforeMiddlewares.jwtAuthenticated,
	beforeMiddlewares.validMongooseObjectIdRouteParams,
	beforeMiddlewares.publishedPost,
	// Validate and sanitise fields.
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
				user: req.user ? req.user : false,
				comment: req.body,
				errors: errors.array(),
			});
		} else {
			// Data is valid.
			// Create a Comment object with escaped and trimmed data.
			const comment = new Comment({
				author: req.user._id,
				post: req.params.postId,
				body: req.body.body,
			});
			comment.save((err, comment) => {
				if (err) {
					next(err);
				} else {
					// Successful
					res.json({
						user: req.user ? req.user : false,
						comment,
					});
				}
			});
		}
	},
];

exports.show = [
	beforeMiddlewares.validMongooseObjectIdRouteParams,
	(req, res, next) => {
		Comment.findOne({ post: req.params.postId, _id: req.params.commentId })
			.populate('author post')
			.exec((err, comment) => {
				if (err) {
					next(err);
				} else if (comment === null) {
					const err = new Error('Page not found');
					err.status = 404;
					next(err);
				} else if (!(req.user && req.user.admin) && !comment.post.published) {
					const err = new Error('Unauthorized');
					err.status = 401;
					next(err);
				} else {
					res.json({
						user: req.user ? req.user : false,
						comment,
					});
				}
			});
	},
];

exports.edit = [
	beforeMiddlewares.jwtAuthenticated,
	beforeMiddlewares.validMongooseObjectIdRouteParams,
	beforeMiddlewares.authorizedToUpdateComment,
	(req, res, next) => {
		res.json({
			user: req.user ? req.user : false,
			comment: req.comment,
		});
	},
];

exports.update = [
	beforeMiddlewares.jwtAuthenticated,
	beforeMiddlewares.validMongooseObjectIdRouteParams,
	beforeMiddlewares.authorizedToUpdateComment,
	// Validate and sanitise fields.
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
				user: req.user ? req.user : false,
				comment: req.body,
				errors: errors.array(),
			});
		} else {
			// Data is valid.
			// Update the record with escaped and trimmed data.
			Comment.findByIdAndUpdate(
				req.params.commentId,
				{
					body: req.body.body,
				},
				{
					new: true,
					runValidators: true,
				}
			).exec((err, updatedComment) => {
				if (err) {
					next(err);
				} else {
					res.json({
						user: req.user,
						comment: updatedComment,
					});
				}
			});
		}
	},
];

exports.destroy = [
	beforeMiddlewares.jwtAuthenticated,
	beforeMiddlewares.validMongooseObjectIdRouteParams,
	(req, res, next) => {
		Comment.findOne({
			post: req.params.postId,
			_id: req.params.commentId,
		}).exec((err, comment) => {
			if (err) {
				next(err);
			} else if (comment === null) {
				const err = new Error('Page not found');
				err.status = 404;
				next(err);
			} else if (
				String(comment.author) !== String(req.user._id) &&
				!req.user.admin
			) {
				/* If user doesn't own the comment and not an admin.
					 Admin can delete any comment.
				*/
				const err = new Error('Unauthorized');
				err.status = 401;
				next(err);
			} else {
				Comment.findByIdAndDelete(req.params.commentId)
					.populate('author post')
					.exec((err, deletedComment) => {
						res.json({
							user: req.user,
							comment: deletedComment,
						});
					});
			}
		});
	},
];
