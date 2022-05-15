const router = require('express').Router();
const controller = require('../controllers/post.controller');

router.get('/number-of-pages', controller.getNumberOfPages);
router.get('/', controller.getPostsOfPage);

module.exports = router;
