const express = require('express');
const router = express.Router();
const passport = require('passport');

const postsController = require('../controllers/postsController');

router.get('/', postsController.index);

router.post('/', postsController.create);

router.get('/:id', postsController.show);

router.get('/:id/edit', postsController.edit);

module.exports = router;
