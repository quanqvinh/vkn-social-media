const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller')

router.get('', userController.getAllUser);

module.exports = router;