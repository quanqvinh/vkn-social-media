const router = require('express').Router();
const controller = require('../controllers/user.controller');

router.post('/add', controller.addNewAccount);
router.patch('/password', controller.changePassword);
router.patch('/:id/disable', controller.changeDisableState);
router.delete('/:id/delete', controller.deleteUser);
router.get('/:id', controller.getUserDetail);

module.exports = router;
