const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller')

router.get('/user/:userId', postController.getPostByUserId);
router.get('/:id', postController.getPostById);

router.delete('/delete/:id', postController.deletePost);

module.exports = router;