const router = require('express').Router();
const postController = require('../controllers/post.controller');

router.delete('/:id/delete', postController.deletePost);
router.get('/:id', postController.getPostDetail);


module.exports = router;
