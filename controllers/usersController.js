const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// Lib
const beforeMiddlewares = require('../lib/beforeMiddlewares');

// Model
const User = require('../models/user');

exports.new = [
	beforeMiddlewares.jwtUnauthenticated,
	(req, res, next) => {
		res.json({
			user: false,
		});
	},
];

exports.create = [
	beforeMiddlewares.jwtUnauthenticated,
	// Validate and sanitise fields.
	body('firstName')
		.trim()
		.isLength({ min: 1 })
		.withMessage('Enter your first name')
		.isLength({ max: 255 })
		.withMessage('First name is too long (maximum is 255 characters)')
		.escape(),
	body('lastName')
		.trim()
		.isLength({ min: 1 })
		.withMessage('Enter your last name')
		.isLength({ max: 255 })
		.withMessage('Last name is too long (maximum is 255 characters)')
		.escape(),
	body('username')
		.trim()
		.isLength({ min: 1 })
		.withMessage('Enter your username')
		.matches(/^[a-z0-9-_]+$/i)
		.withMessage('Username can only contain letters, numbers, - and _')
		.isLength({ max: 20 })
		.withMessage('Username is too long (maximum is 20 characters)')
		.escape()
		.custom((value, { req }) => {
			return User.findOne({ username: value }).then((user) => {
				if (user) {
					throw new Error('Username already exists, pick another username');
				} else {
					// Indicates the success of this synchronous custom validator
					return true;
				}
			});
		}),
	body('password')
		.isLength({ min: 8 })
		.withMessage('Password is too short (minimum is 8 characters)'),
	body('confirmPassword').custom((value, { req }) => {
		if (value !== req.body.password) {
			throw new Error('Password confirmation does not match password');
		} else {
			return true;
		}
	}),
	body('adminPasscode').custom((adminPasscode, { req }) => {
		if (req.body.isAdminPasscodeRequired === true) {
			if (adminPasscode !== process.env.ADMIN_PASSCODE) {
				throw new Error('Admin passcode is incorrect');
			} else {
				return true;
			}
		} else {
			return true;
		}
	}),
	// Process request after validation and sanitization.
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// There are errors.
			res.json({
				user: false,
				userFormData: req.body,
				errors: errors.array(),
			});
		} else {
			// Data form is valid.
			// Create the new user with hashed password
			bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
				if (err) {
					next(err);
				} else {
					const user = new User({
						firstName: req.body.firstName,
						lastName: req.body.lastName,
						username: req.body.username,
						password: hashedPassword,
						admin:
							req.body.isAdminPasscodeRequired === true
								? req.body.adminPasscode === process.env.ADMIN_PASSCODE
								: false,
					});
					user.save((err) => {
						if (err) {
							next(err);
						} else {
							// Successful
							res.json({ user: user.forPublic });
						}
					});
				}
			});
		}
	},
];

exports.getCurrentUser = (req, res, next) => {
	res.json({ user: req.user ? req.user.forPublic : false });
};
