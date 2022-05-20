const router = require('express').Router();
const controller = require('../controllers/post.controller');

router.get('/', controller.getPostsOfPage);

module.exports = router;
