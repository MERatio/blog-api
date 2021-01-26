const express = require('express');
const router = express.Router();
const passport = require('passport');

const postsController = require('../controllers/postsController');

router.get('/', postsController.index);

router.post('/', postsController.create);

module.exports = router;
