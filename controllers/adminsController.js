const beforeMiddlewares = require('../lib/beforeMiddlewares');

exports.new = [
	beforeMiddlewares.jwtAuthenticated,
	beforeMiddlewares.nonAdmin,
	(req, res, next) => {
		res.json({ user: req.user.forPublic });
	},
];
