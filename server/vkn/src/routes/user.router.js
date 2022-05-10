const router = require('express').Router();
const controller = require('../controllers/user.controller');
const { uploadAvatar } = require('../middlewares/upload.middleware');

router.get('/me/profile', controller.getMyProfile);
router.get('/search', controller.searchUser);
router.get('/notifications', controller.getAllNotification);
router.get('/notification/check', controller.checkNotification);
router.get('/:id', controller.getUserProfile);

router.post('/edit/email/request', controller.requestEditUserEmail);
router.post('/upload/avatar', uploadAvatar.single('avatar'), controller.uploadProfilePicture);
router.post('/friends/accept-request', controller.acceptAddFriendRequest);
router.post('/friends/decline-request', controller.declineAddFriendRequest);
router.post('/friends/undo-request', controller.undoAddFriendRequest);
router.post('/friends/unfriend', controller.unfriend);

router.patch('/edit/info', controller.editUserProfile);
router.patch('/edit/email', controller.editUserEmail);
router.patch('/edit/password', controller.changePassword);

router.delete('/delete', controller.softDeleteUser);
router.delete('/notification/:id', controller.deleteNotification);


module.exports = router;