import "./profilePreview.scss";
import ProfileIcon from "./ProfileIcon";
import users from "../../../data/users";
import { memo } from "react";

function ProfilePreview(props) {
   const {
      username,
      name,
      urlText,
      iconSize,
      captionSize,
      storyBorder,
      hideAccountName,
      image,
      src,
      getToRoom,
      room,
   } = props;

   let accountName = username
      ? username
      : users[Math.floor(Math.random() * users.length)].username;

   const handelGetToRoom = () => {
      if (!(src === "ListChat")) return;
      let selectedRoom = {
         chatMate: room.chatMate,
         roomId: room._id,
      };

      getToRoom(selectedRoom);
   };
   return (
      <div
         className={`profile ${src === "ListChat" ? "profile--chat" : ""}`}
         onClick={handelGetToRoom}
      >
         <ProfileIcon
            iconSize={iconSize}
            storyBorder={storyBorder}
            image={image}
         />
         {(accountName || name) && !hideAccountName && (
            <div className="textContainer">
               <span className={`accountName ${captionSize}`}>
                  {accountName}
               </span>
               <span className={`name ${captionSize}`}>{name}</span>
            </div>
         )}
         <a href="/">{urlText}</a>
      </div>
   );
}

export default memo(ProfilePreview);
