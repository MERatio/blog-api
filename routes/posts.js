const express = require('express');
const router = express.Router();
const passport = require('passport');

const postsController = require('../controllers/postsController');

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

router.post('/', postsController.create);

module.exports = router;
