const passport = require('passport');
const { body, validationResult } = require('express-validator');

const Post = require('../models/post');

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
				post: false,
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
						post: false,
						errors: [{ msg: 'Something went wrong, please try again later' }],
					});
				} else {
					// Successful
					res.json({
						post,
						errors: false,
					});
				}
			});
		}
	},
];
