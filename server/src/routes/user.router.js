const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.get('/me/profile', userController.getMyProfile);
router.get('/', userController.getUserProfile);
router.patch('/edit', userController.editUserProfile);
router.delete('/delete', userController.softDeleteUser);

module.exports = router;