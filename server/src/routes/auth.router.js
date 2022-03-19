const express = require('express');
const router = express();
const controller = require('../controllers/auth.controller');

router.post('/signup', controller.signup);
router.get('/login', controller.login);
router.get('/verify/:id/:token', controller.verifyEmail);

module.exports = router;