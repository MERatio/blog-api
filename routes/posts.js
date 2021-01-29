const express = require('express');
const router = express.Router();

const postsController = require('../controllers/postsController');

router.get('/', postsController.index);

router.post('/', postsController.create);

router.get('/:id', postsController.show);

router.get('/:id/edit', postsController.edit);

router.put('/:id', postsController.update);

module.exports = router;
