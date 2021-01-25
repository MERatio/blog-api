const passport = require('passport');
const jwt = require('jsonwebtoken');

exports.signIn = (req, res, next) => {
	passport.authenticate('local', { session: false }, (err, user, info) => {
		if (err) {
			res.status(400).json({ message: info.message, user });
		} else if (!user) {
			res.status(404).json({ message: info.message, user });
		} else {
			req.login(user, { session: false }, (err) => {
				if (err) {
					res.send(err);
				} else {
					/* 
						Matching username and password.
						Generate a signed json web token with the contents of user object 
					  and return it in the response.
					*/
					const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
						expiresIn: '7d',
					});
					res.json({ user, token });
				}
			});
		}
	})(req, res, next);
};
