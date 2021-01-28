const passport = require('passport');
const { body, validationResult } = require('express-validator');
const async = require('async');

// Lib
const beforeMiddlewares = require('../lib/beforeMiddlewares');

// Models
const Post = require('../models/post');
const Comment = require('../models/comment');

exports.index = [
	beforeMiddlewares.optionalJwtAuth,
	(req, res, next) => {
		async.waterfall(
			[
				(callback) => {
					if (req.user) {
						Post.find(callback);
					} else {
						Post.find({ published: true }, callback);
					}
				},
				(posts, callback) => {
					if (req.user) {
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
					res.status(500).json({
						errors: [{ msg: 'Something went wrong, please try again later' }],
					});
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
	passport.authenticate('jwt', { session: false }),
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
					res.status(500).json({
						errors: [{ msg: 'Something went wrong, please try again later' }],
					});
				} else {
					// Successful
					res.json({ post });
				}
			});
		}
	},
];
