#! /usr/bin/env node

console.log(
  'This script populates some test data to your database. Specified database as argument - e.g.: populatedb <connection_string>'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/

// Libraries
const mongoose = require('mongoose');
const async = require('async');
const bcrypt = require('bcryptjs');

// Model
const User = require('./models/user');

// Set up default mongoose connection
const mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const users = [];

const userCreate = (username, password, cb) => {
  const userDetail = { username, password };
  const user = new User(userDetail);
  user.save((err) => {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New User: ' + user);
    users.push(user);
    cb(null, user);
  });
};

const createUsers = (cb) => {
  async.series(
    [
      (callback) => {
        bcrypt.hash('password123', 10, (err, hashedPassword) => {
          userCreate('johnDoe01', hashedPassword, callback);
        });
      },
    ],
    // Optional callback
    cb
  );
};

async.series(
  [createUsers],
  // Optional callback
  (err, results) => {
    if (err) {
      console.log('FINAL ERR: ' + err);
    } else {
      console.log('All done');
    }
    // All done, disconnect from database
    db.close();
  }
);
