const User = require("../models/user.model");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = (io, socket) => {
   console.log(socket.handshake.auth);
   // let listFriendIds = getListFriends(socket.handshake.auth.userId);
   // let userInfo = {
   // 	username: socket.handshake.auth.username,
   // 	useId: socket.handshake.auth.userId
   // };

   // io.to(listFriendIds).emit('home:friend_connect', userInfo);

   // socket.on('disconnect', () => {
   // 	io.to(listFriendIds).emit('home:friend_disconnect', userInfo);
   // 	console.log(`Socket ID ${socket.id} disconnect!`);
   // });
};

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
   return user[0].friends.map((friendId) => friendId.toString());
}
