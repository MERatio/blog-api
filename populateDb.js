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

// Models
const User = require('./models/user');
const Post = require('./models/post');
const Comment = require('./models/comment');

// Set up default mongoose connection
const mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const users = [];
const posts = [];
const comments = [];

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

const postCreate = (author, title, body, published, cb) => {
  const postDetail = { author, title, body, published };
  const post = new Post(postDetail);
  post.save((err) => {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New post: ' + post);
    posts.push(post);
    cb(null, post);
  });
};

const commentCreate = (post, username, body, cb) => {
  const commentDetail = { post, username, body };
  const comment = new Comment(commentDetail);
  comment.save((err) => {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New comment: ' + comment);
    comments.push(comment);
    cb(null, comment);
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

const createPosts = (cb) => {
  async.series(
    [
      (callback) => {
        postCreate(
          users[0],
          'Unpublished post',
          `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ultricies commodo dignissim. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aliquam interdum sem quam, a porttitor massa volutpat a. Etiam mollis accumsan ultricies. Integer mattis volutpat efficitur. Praesent justo eros, rhoncus eu est sit amet, ultrices lacinia dui. In interdum ex a dolor porta viverra. Sed justo ligula, aliquet ut nisi et, rutrum aliquam nulla. Donec tristique in mi a accumsan. Praesent commodo dui augue. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum libero nibh, ullamcorper facilisis elementum in, aliquet pellentesque mi. Aliquam facilisis maximus dolor nec bibendum. Vivamus id auctor sapien.`,
          false,
          callback
        );
      },
      (callback) => {
        postCreate(
          users[0],
          'Published post',
          `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec in ultricies enim. Nam ultricies maximus massa, id tempus nisi sagittis et. Sed nec tempus eros. Nam nec odio sagittis dui malesuada tempus. Mauris tincidunt nunc eu quam euismod rutrum. Quisque nibh justo, dapibus vel aliquam porta, malesuada nec neque. Maecenas faucibus lacus ipsum, eu tincidunt odio pulvinar a. Aliquam erat volutpat. Quisque ipsum eros, imperdiet vel nisi et, facilisis aliquet quam. Aliquam sit amet nibh placerat, euismod dolor vel, pharetra arcu. Phasellus pulvinar vehicula dui, quis tincidunt risus euismod a. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eget accumsan augue, eu consequat ante. Nunc non volutpat sem. Mauris eget enim et purus placerat viverra sed quis nisl. Curabitur in mi eu dolor consequat fringilla vel eget metus.`,
          true,
          callback
        );
      },
    ],
    // Optional callback
    cb
  );
};

const createComments = (cb) => {
  async.series(
    [
      (callback) => {
        commentCreate(
          posts[0],
          'commenter1',
          'Comment on unpublished post (the post is published before when someone commented on it then became unpublished)',
          callback
        );
      },
      (callback) => {
        commentCreate(
          posts[0],
          'commenter2',
          'Comment on unpublished post (the post is published before when someone commented on it then became unpublished)',
          callback
        );
      },
    ],
    // Optional callback
    cb
  );
};

async.series(
  [createUsers, createPosts, createComments],
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
