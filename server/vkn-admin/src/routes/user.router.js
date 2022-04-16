const express = require('express');
const router = express.Router();


router.get('', userController.getAll);
router.get('/:id', userController.getUserProfile);

router.patch('/enable/:id', userController.editUserProfile);
router.patch('/disable/:id', userController.editUserEmail);



module.exports = router;