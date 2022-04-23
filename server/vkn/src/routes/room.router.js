const router = require('express').Router();
const controller = require('../controllers/room.controller');

router.get('/check', controller.checkRoom);
router.get('/:roomId', controller.loadMessage);
router.get('/', controller.getRooms);


module.exports = router;