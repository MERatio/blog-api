const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

router.get('/sign-in', authController.new);

router.post('/sign-in', authController.create);

module.exports = router;
