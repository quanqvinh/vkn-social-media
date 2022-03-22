const express = require('express');
const router = express();
const controller = require('../controllers/auth.controller');

router.post('/signup', controller.signup);
router.get('/login', controller.login);
router.post('/request/verify-email', controller.requestVerifyEmail);
router.patch('/verify-email', controller.verifyEmail);
router.post('/request/reset-password', controller.requestResetPassword);
router.patch('/reset-password', controller.resetPassword);

module.exports = router;
