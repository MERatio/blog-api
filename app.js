require('dotenv').config();

const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');

const app = express();

// Set up default mongoose connection
const mongoDB = process.env.DEV_DB_STRING;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

module.exports = app;
