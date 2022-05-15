const express = require('express');
const router = express.Router();
const controller = require('../controllers/user.controller');

router.get('/number-of-pages', controller.getNumberOfPages);
router.get('/', controller.getUsersOfPage);

module.exports = router;
