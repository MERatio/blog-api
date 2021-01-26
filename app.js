require('dotenv').config();

const express = require('express');
const logger = require('morgan');

// Config
const passportConfig = require('./config/passportConfig');

// Require routers
const authRouter = require('./routes/auth');
const postsRouter = require('./routes/posts');

const app = express();

// Set up default mongoose connection
require('./config/db');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passportConfig.initialize());

// Use the routers
app.use('/auth', authRouter);
app.use('/posts', postsRouter);

module.exports = app;
