const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

router.post('/sign-in', authController.signIn);

module.exports = router;
