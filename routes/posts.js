const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get(
	'/',
	passport.authenticate('jwt', { session: false }),
	(req, res, next) => {
		// Dummy json response
		res.json({
			posts: [
				{ title: 'Post 1', body: 'Hello World', published: false },
				{ title: 'Post 2', body: 'Hi World', published: true },
			],
		});
	}
);

module.exports = router;
