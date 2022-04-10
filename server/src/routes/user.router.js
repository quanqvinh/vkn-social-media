const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { uploadAvatar } = require('../middlewares/upload.middleware');

router.get('/me/profile', userController.getMyProfile);
router.get('/:id', userController.getUserProfile);

router.post('/edit/email/request', userController.requestEditUserEmail);
router.post('/upload/avatar', uploadAvatar.single('avatar'), userController.uploadProfilePicture);

router.patch('/edit/info', userController.editUserProfile);
router.patch('/edit/email', userController.editUserEmail);
router.patch('/edit/password', userController.changePassword);

router.delete('/delete', userController.softDeleteUser);


module.exports = router;