const fs = require('fs');
const Room = require('../models/room.model');
const Message = require('../models/schemas/message.schema').model;
const ObjectId = require('mongoose').Types.ObjectId;
const resourceHelper = require('../utils/resourceHelper');

async function validateRoom(roomId, user1, user2) {
   let room = await Room.aggregate([
      {
         $match: {
            _id: ObjectId(roomId),
         },
      },
      {
         $project: {
            chatMate: 1,
         },
      },
   ]);
   console.log(room);
   if (!room) return false;
   let chatMate = room[0].chatMate;
   if (chatMate[0].toString() === user1 && chatMate[1].toString() === user2)
      return true;
   if (chatMate[1].toString() === user1 && chatMate[0].toString() === user2)
      return true;
   return false;
}

module.exports = (io, socket) => {
   socket.on('chat:send_message', async (payload) => {
      try {
         let { username, userId, roomId, content } = payload;

         let message = new Message({
            sendBy: socket.handshake.auth.username,
            content,
         });

         await Room.updateOne(
            { _id: roomId },
            {
               $push: { messages: message },
            }
         );

         io.to(username).emit('chat:print_message', {
            roomId,
            userId,
            username: socket.handshake.auth.username,
            message: message._doc,
            sendAt: Date.now(),
         });
      } catch (error) {
         console.log(error);
         socket.emit('error');
      }
   });

   socket.on('chat:send_image', async (payload) => {
      try {
         let { image, username, userId, roomId } = payload;

         if (!validateRoom(roomId, userId, socket.handshake.auth.userId))
            throw Error('Room error');

         let imageBase64 = image.split(';base64,')[1];
         let message = new Message({
            sendBy: username,
            isImage: true,
         });

         let roomResource =  resourceHelper.createRoomImageFile(roomId);
         if (!fs.existsSync(roomResource)) fs.mkdirSync(roomResource);

         fs.writeFileSync(
            roomResource + `/${message._id.toString()}.png`,
            imageBase64,
            { encoding: 'base64' }
         );

         console.log(socket.handshake.auth);
         io.to(username).emit('chat:print_message', {
            roomId,
            userId,
            username: socket.handshake.auth.username,
            message: message._doc,
         });

         await Room.updateOne(
            { _id: roomId },
            {
               $push: { messages: message },
            }
         );
      } catch (error) {
         console.log(error);
         socket.emit('error');
      }
   });
};
