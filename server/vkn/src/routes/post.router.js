const router = require('express').Router();
const controller = require('../controllers/post.controller');
const { uploadPost } = require('../middlewares/upload.middleware');

router.get('/new-feed', controller.newFeed);
router.post('/new', uploadPost.array('images', 10), controller.newPost);
router.get('/:postId', controller.detailPost);
router.post('/report', controller.reportPost);
router.put('/', uploadPost.array('images', 10), controller.updatePost);
router.delete('/:id', controller.deletePost);
router.patch('/:id/like', controller.likePost);

module.exports = router;