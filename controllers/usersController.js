// Lib
const beforeMiddlewares = require('../lib/beforeMiddlewares');

exports.new = [
	beforeMiddlewares.jwtUnauthenticated,
	(req, res, next) => {
		res.json({
			user: false,
		});
	},
];
