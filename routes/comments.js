const express = require('express');
const router = express.Router({ mergeParams: true });

const commentsController = require('../controllers/commentsController');

router.get('/', commentsController.index);

router.get('/new', commentsController.new);

router.post('/', commentsController.create);

router.get('/:commentId', commentsController.show);

module.exports = router;
