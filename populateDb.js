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

async function userCreate(firstName, lastName, username, password, admin, cb) {
  try {
    const userDetail = { firstName, lastName, username, password, admin };
    const user = new User(userDetail);
    const savedUser = await user.save();
    console.log('New User: ' + savedUser);
    users.push(savedUser);
    cb(null, savedUser);
  } catch (err) {
    cb(err, null);
  }
}

async function postCreate(author, title, body, published, cb) {
  try {
    const postDetail = { author, title, body, published };
    const post = new Post(postDetail);
    const savedPost = await post.save();
    console.log('New post: ' + savedPost);
    posts.push(savedPost);
    cb(null, savedPost);
  } catch (err) {
    cb(err, null);
  }
}

async function commentCreate(author, post, body, cb) {
  try {
    const commentDetail = { author, post, body };
    const comment = new Comment(commentDetail);
    const savedComment = await comment.save();
    console.log('New comment: ' + savedComment);
    comments.push(savedComment);
    cb(null, savedComment);
  } catch (err) {
    cb(err, null);
  }
}

function createUsers(cb) {
  async.series(
    [
      (callback) => {
        bcrypt.hash('password123', 10, (err, hashedPassword) => {
          userCreate(
            'John',
            'Doe',
            'johnDoe01',
            hashedPassword,
            true,
            callback
          );
        });
      },
      (callback) => {
        bcrypt.hash('password123', 10, (err, hashedPassword) => {
          userCreate(
            'Jane',
            'Doe',
            'janeDoe01',
            hashedPassword,
            false,
            callback
          );
        });
      },
    ],
    // Optional callback
    cb
  );
}

function createPosts(cb) {
  async.series(
    [
      (callback) => {
        postCreate(
          users[0],
          'Unpublished post 1',
          `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ultricies commodo dignissim. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aliquam interdum sem quam, a porttitor massa volutpat a. Etiam mollis accumsan ultricies. Integer mattis volutpat efficitur. Praesent justo eros, rhoncus eu est sit amet, ultrices lacinia dui. In interdum ex a dolor porta viverra. Sed justo ligula, aliquet ut nisi et, rutrum aliquam nulla. Donec tristique in mi a accumsan. Praesent commodo dui augue. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum libero nibh, ullamcorper facilisis elementum in, aliquet pellentesque mi. Aliquam facilisis maximus dolor nec bibendum. Vivamus id auctor sapien.`,
          false,
          callback
        );
      },
      (callback) => {
        postCreate(
          users[0],
          'Unpublished post 2',
          `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ultricies commodo dignissim. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aliquam interdum sem quam, a porttitor massa volutpat a. Etiam mollis accumsan ultricies. Integer mattis volutpat efficitur. Praesent justo eros, rhoncus eu est sit amet, ultrices lacinia dui. In interdum ex a dolor porta viverra. Sed justo ligula, aliquet ut nisi et, rutrum aliquam nulla. Donec tristique in mi a accumsan. Praesent commodo dui augue. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum libero nibh, ullamcorper facilisis elementum in, aliquet pellentesque mi. Aliquam facilisis maximus dolor nec bibendum. Vivamus id auctor sapien.`,
          false,
          callback
        );
      },
      (callback) => {
        postCreate(
          users[0],
          'Published post 1',
          `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec in ultricies enim. Nam ultricies maximus massa, id tempus nisi sagittis et. Sed nec tempus eros. Nam nec odio sagittis dui malesuada tempus. Mauris tincidunt nunc eu quam euismod rutrum. Quisque nibh justo, dapibus vel aliquam porta, malesuada nec neque. Maecenas faucibus lacus ipsum, eu tincidunt odio pulvinar a. Aliquam erat volutpat. Quisque ipsum eros, imperdiet vel nisi et, facilisis aliquet quam. Aliquam sit amet nibh placerat, euismod dolor vel, pharetra arcu. Phasellus pulvinar vehicula dui, quis tincidunt risus euismod a. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eget accumsan augue, eu consequat ante. Nunc non volutpat sem. Mauris eget enim et purus placerat viverra sed quis nisl. Curabitur in mi eu dolor consequat fringilla vel eget metus.`,
          true,
          callback
        );
      },
      (callback) => {
        postCreate(
          users[0],
          'Published post 2',
          `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec in ultricies enim. Nam ultricies maximus massa, id tempus nisi sagittis et. Sed nec tempus eros. Nam nec odio sagittis dui malesuada tempus. Mauris tincidunt nunc eu quam euismod rutrum. Quisque nibh justo, dapibus vel aliquam porta, malesuada nec neque. Maecenas faucibus lacus ipsum, eu tincidunt odio pulvinar a. Aliquam erat volutpat. Quisque ipsum eros, imperdiet vel nisi et, facilisis aliquet quam. Aliquam sit amet nibh placerat, euismod dolor vel, pharetra arcu. Phasellus pulvinar vehicula dui, quis tincidunt risus euismod a. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eget accumsan augue, eu consequat ante. Nunc non volutpat sem. Mauris eget enim et purus placerat viverra sed quis nisl. Curabitur in mi eu dolor consequat fringilla vel eget metus.`,
          true,
          callback
        );
      },
    ],
    // Optional callback
    cb
  );
}

function createComments(cb) {
  async.series(
    [
      (callback) => {
        commentCreate(
          users[0],
          posts[0],
          'Comment on unpublished post (the post is published before when someone commented on it then became unpublished) 1',
          callback
        );
      },
      (callback) => {
        commentCreate(
          users[1],
          posts[0],
          'Comment on unpublished post (the post is published before when someone commented on it then became unpublished) 2',
          callback
        );
      },
      (callback) => {
        commentCreate(
          users[0],
          posts[2],
          'Comment on published post 1',
          callback
        );
      },
      (callback) => {
        commentCreate(
          users[1],
          posts[2],
          'Comment on published post 2',
          callback
        );
      },
    ],
    // Optional callback
    cb
  );
}

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
