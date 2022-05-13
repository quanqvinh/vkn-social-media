import React from "react";
import { useEffect, useState } from "react";
import ProfilePreview from "../../Profile/ProfilePreview/ProfilePreview";
import "./listchat.scss";
import userApi from "../../../apis/userApi";
import { memo } from "react";

const ListChat = (props) => {
   const { latestMessage, getToRoom } = props;
   const [listRooms, setListRooms] = useState([]);

   useEffect(() => {
      const fetchRooms = async () => {
         try {
            let res = await userApi.getRooms();
            console.log(res);
            res?.data?.rooms && setListRooms([...listRooms, ...res.data.rooms]);
         } catch (error) {
            console.log(error.message);
         }
      };
      fetchRooms();
   }, []);

   return (
      <div className="list-room">
         {listRooms?.length > 0 &&
            listRooms.map((room) => (
               <ProfilePreview
                  image={
                     process.env.REACT_APP_STATIC_URL +
                     `/avatars/${room.chatMate._id}.png`
                  }
                  key={room._id}
                  room={room}
                  getToRoom={getToRoom}
                  username={room.chatMate.username}
                  name={
                     latestMessage.roomId === room._id
                        ? latestMessage.content !== null
                           ? latestMessage.content
                           : "image has been sent"
                        : room.messages[0].content !== null
                        ? room.messages[0].content
                        : "image has been sent"
                  }
                  iconSize="big"
                  src="ListChat"
               />
            ))}
      </div>
   );
};

export default memo(ListChat);
