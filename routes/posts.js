const express = require('express');
const router = express.Router();

const postsController = require('../controllers/postsController');

router.get('/', postsController.index);

router.get('/new', postsController.new);

router.post('/', postsController.create);

router.get('/:postId', postsController.show);

router.get('/:postId/edit', postsController.edit);

router.put('/:postId', postsController.update);

router.delete('/:postId', postsController.destroy);

module.exports = router;
