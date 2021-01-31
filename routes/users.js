const express = require('express');
const router = express.Router();

const usersController = require('../controllers/usersController');

router.get('/new', usersController.new);

module.exports = router;
