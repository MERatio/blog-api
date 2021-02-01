const express = require('express');
const router = express.Router();

const adminsController = require('../controllers/adminsController');

router.get('/new', adminsController.new);

module.exports = router;
