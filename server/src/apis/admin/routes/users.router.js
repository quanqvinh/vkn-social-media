const router = require('express').Router();
const controller = require('../controllers/user.controller');

router.get('/disabled/search', controller.getUsersOfPage);
router.get('/disabled', controller.getUsersOfPage);
router.get('/search', controller.getUsersOfPage);
router.get('/', controller.getUsersOfPage);

module.exports = router;
