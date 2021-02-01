const { body, validationResult } = require('express-validator');

// Lib
const beforeMiddlewares = require('../lib/beforeMiddlewares');

// Model
const User = require('../models/user');

exports.new = [
	beforeMiddlewares.jwtAuthenticated,
	beforeMiddlewares.nonAdmin,
	(req, res, next) => {
		res.json({ user: req.user.forPublic });
	},
];

exports.create = [
	beforeMiddlewares.jwtAuthenticated,
	beforeMiddlewares.nonAdmin,
	body('adminPasscode').custom((adminPasscode) => {
		if (adminPasscode !== process.env.ADMIN_PASSCODE) {
			throw new Error('Admin passcode is incorrect');
		} else {
			return true;
		}
	}),
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// There are errors.
			res.json({
				user: req.user.forPublic,
				errors: errors.array(),
			});
		} else {
			// Admin passcode is correct. Update the user
			User.findByIdAndUpdate(
				req.user._id,
				{ admin: true },
				{ new: true, runValidators: true }
			).exec((err, user) => {
				if (err) {
					next(err);
				} else {
					res.json({ user: user.forPublic });
				}
			});
		}
	},
];
