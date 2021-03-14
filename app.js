require('dotenv').config();

const express = require('express');
const logger = require('morgan');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');

// Config
const passportConfig = require('./config/passportConfig');

// Lib
const beforeMiddlewares = require('./lib/beforeMiddlewares');
const middlewares = require('./lib/middlewares');

// Require routers
const adminRouter = require('./routes/admins');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const commentsRouter = require('./routes/comments');

const app = express();

const allowedOrigins = ['http://localhost:3000', 'https://meratio.github.io'];
app.use(
	cors({
		origin(origin, callback) {
			if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
				callback(null, true);
			} else {
				callback(new Error('Not allowed by CORS'));
			}
		},
		optionsSuccessStatus: 200,
	})
);

app.use(helmet());

// Set up default mongoose connection
require('./config/db');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(compression()); // Compress all routes
app.use(passportConfig.initialize());

app.use(middlewares.setUserUsingJwtAuth);

// Use the routers
app.use(
	'/admins',
	beforeMiddlewares.jwtAuthenticated,
	beforeMiddlewares.nonAdmin,
	adminRouter
);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/posts/:postId/comments', commentsRouter);

// Error handler
app.use((err, req, res, next) => {
	res.status(err.status ? err.status : 500).send({
		user: req.user ? req.user.forPublic : false,
		err: { ...err, message: err.message },
	});
});

module.exports = app;
