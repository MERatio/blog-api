require('dotenv').config();

const express = require('express');
const logger = require('morgan');

// Config
const passportConfig = require('./config/passportConfig');

// Lib
const beforeMiddlewares = require('./lib/beforeMiddlewares');

// Require routers
const authRouter = require('./routes/auth');
const postsRouter = require('./routes/posts');
const commentsRouter = require('./routes/comments');

const app = express();

// Set up default mongoose connection
require('./config/db');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passportConfig.initialize());

app.use(beforeMiddlewares.setUserUsingJwtAuth);

// Use the routers
app.use('/auth', authRouter);
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
