require('dotenv').config();

const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');

// Config
const passportConfig = require('./config/passportConfig');

// Require routers
const authRouter = require('./routes/auth');
const postsRouter = require('./routes/posts');

const app = express();

// Set up default mongoose connection
const mongoDB = process.env.DEV_DB_STRING;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passportConfig.initialize());

// Use the routers
app.use('/auth', authRouter);
app.use('/posts', postsRouter);

module.exports = app;
