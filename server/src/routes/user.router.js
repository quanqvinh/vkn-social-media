const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.get('/me/profile', userController.getMyProfile);
router.get('/:id', userController.getUserProfile);
router.patch('/edit/info', userController.editUserProfile);
router.post('/edit/email/request', userController.requestEditUserEmail);
router.patch('/edit/email', userController.editUserEmail);
router.delete('/delete', userController.softDeleteUser);


module.exports = router;