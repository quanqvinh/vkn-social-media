const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.get('/', userController.getUserInformation);
router.patch('/', userController.updateUserInformation);
router.delete('/', userController.deleteUserInformation);

module.exports = router;