const express = require('express');
const router = express();
const controller = require('../controllers/auth.controller');

router.post('/signup', controller.signup);
router.get('/login', controller.login);

module.exports = router;