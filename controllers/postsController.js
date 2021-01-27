const passport = require('passport');
const { body, validationResult } = require('express-validator');
const async = require('async');

// Models
const Post = require('../models/post');
const Comment = require('../models/comment');

exports.index = [
	(req, res, next) => {
		if (req.headers.authorization) {
			passport.authenticate('jwt', { session: false }, (err, user) => {
				if (err) {
					res.status(500).json({
						errors: [{ msg: 'Something went wrong, please try again later' }],
					});
				} else if (!user) {
					res.status(401).send('Unauthorized');
				} else {
					req.user = user;
				}
				next();
			})(req, res, next);
		} else {
			next();
		}
	},
	(req, res, next) => {
		async.parallel(
			{
				posts(callback) {
					Post.find(req.user ? {} : { published: true }, callback);
				},
				comments(callback) {
					Comment.find(callback);
				},
			},
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
