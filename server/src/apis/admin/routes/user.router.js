const router = require('express').Router();
const controller = require('../controllers/user.controller');

// router.get('/search', userController.searchUser);
router.get('/:id', controller.getUserDetail);

// router.patch('/enable/:id', userController.enableUser);
// router.patch('/disable/:id', userController.disableUser);

module.exports = router;
