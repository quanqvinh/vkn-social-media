const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.get('/me/profile', userController.getMyProfile);
router.get('/', userController.getUserProfile);

module.exports = router;