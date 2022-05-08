const router = require('express').Router();
const controller = require('../controllers/room.controller');

router.get('/check', controller.checkRoom);
router.get('/:roomId', controller.loadMessage);
router.get('/', controller.getRooms);
router.delete('/message/delete', controller.deleteMessage);
router.delete('/message/recall', controller.recallMessage);


module.exports = router;