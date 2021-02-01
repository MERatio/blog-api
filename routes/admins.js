const express = require('express');
const router = express.Router();

const adminsController = require('../controllers/adminsController');

router.get('/new', adminsController.new);

router.post('/', adminsController.create);

module.exports = router;
