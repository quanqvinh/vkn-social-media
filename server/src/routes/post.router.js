const express = require('express');
const router = express();
const controller = require('../controllers/post.controller');
const { uploadPost } = require('../middlewares/upload.middleware');

router.get('/new-feed', controller.newFeed);
router.post('/new', uploadPost.array('images', 10), controller.newPost);
router.get('/detail', controller.detailPost);
router.post('/report', controller.reportPost);
router.put('/', uploadPost.array('images', 10), controller.updatePost);
router.delete('/', controller.deletePost);

module.exports = router;