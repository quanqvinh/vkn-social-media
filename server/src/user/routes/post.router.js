const router = require('express').Router();
const controller = require('../controllers/post.controller');
const { uploadPost } = require('../middlewares/upload.middleware');

router.get('/new-feed', controller.newFeed);
router.get('/:postId', controller.detailPost);
router.post('/new', uploadPost.array('images', 10), controller.newPost);
router.post('/report', controller.reportPost);
router.put('/', uploadPost.array('images', 10), controller.updatePost);
router.patch('/comment/:commentId/like', controller.likeComment);
router.patch('/:postId/like', controller.likePost);
router.delete('/comment', controller.deleteComment);
router.delete('/reply', controller.deleteReply);
router.delete('/:postId', controller.deletePost);

module.exports = router;
