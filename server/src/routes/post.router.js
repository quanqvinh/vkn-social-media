const express = require('express');
const router = express();
const controller = require('../controllers/post.controller');

router.get('/', controller.loadPost);
router.post('/', controller.newPost);
router.patch('/', controller.updatePost);
router.delete('/', controller.deletePost);

module.exports = router;