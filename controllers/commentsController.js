// Lib
const beforeMiddlewares = require('../lib/beforeMiddlewares');

// Models
const Comment = require('../models/comment');
const Post = require('../models/post');

exports.index = [
	beforeMiddlewares.validMongooseObjectIdRouteParams({
		postId: 'Post not found',
	}),
	(req, res, next) => {
		Post.findOne({
			_id: req.params.postId,
			...(!req.user && { published: true }),
		}).exec((err, post) => {
			if (err) {
				next(err);
			} else if (post === null) {
				const err = new Error('Post not found');
				err.status = 404;
				next(err);
			} else {
				Comment.find({ post: req.params.postId }).exec((err, comments) => {
					if (err) {
						next(err);
					} else {
						res.json({
							user: req.user ? req.user.forPublic : false,
							comments,
						});
					}
				});
			}
		});
	},
];
