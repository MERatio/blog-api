const passport = require('passport');
const jwt = require('jsonwebtoken');

exports.signIn = (req, res, next) => {
	passport.authenticate('local', { session: false }, (err, user, info) => {
		if (err) {
			next(err);
		} else if (!user) {
			const err = new Error(info.message);
			err.status = 404;
			next(err);
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
					const jwtPayload = { userId: user._id };
					const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
						expiresIn: '7d',
					});
					res.json({ token, user: user.forPublic });
				}
			});
		}
	})(req, res, next);
};
