const User = require("../models/user.model");
const ObjectId = require("mongoose").Types.ObjectId;
const objectIdHelper = require('../utils/objectIdHelper');

module.exports = (function() {
   async function getListFriends(_id) {
      let user = await User.aggregate([
         {
            $match: {
               _id: ObjectId(_id),
            },
         },
         {
            $project: {
               _id: 0,
               friends: 1,
            },
         },
      ]);
      return objectIdHelper.listString(user[0].friends);
   }
   
   return async (io, socket) => {
      let listFriendIds = await getListFriends(socket.handshake.auth.userId);
      let userInfo = {
         username: socket.handshake.auth.username,
         useId: socket.handshake.auth.userId
      };
   
      io.to(listFriendIds).emit('home:friend_connect', userInfo);
   
      socket.on('disconnect', () => {
         io.to(listFriendIds).emit('home:friend_disconnect', userInfo);
         console.log(`Socket ID ${socket.id} disconnect!`);
      });
   }
})();
