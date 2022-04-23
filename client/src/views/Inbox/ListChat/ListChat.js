import React from "react";
import ProfilePreview from "../../Profile/ProfilePreview/ProfilePreview";

const ListChat = (props) => {
   const { chooseRoom } = props;

   return (
      <div style={{ maxHeight: "80%", overflowY: "scroll" }}>
         <ProfilePreview
            chooseRoom={chooseRoom}
            username="kien108"
            name="Hello everybody"
            iconSize="big"
            src="ListChat"
         />
         <ProfilePreview
            username="kien109"
            name="Today i feel so good"
            iconSize="big"
            src="ListChat"
         />
         <ProfilePreview
            username="kien109"
            name="Today i feel so good"
            iconSize="big"
            src="ListChat"
         />
         <ProfilePreview
            username="kien109"
            name="Today i feel so good"
            iconSize="big"
            src="ListChat"
         />
         <ProfilePreview
            username="kien109"
            name="Today i feel so good"
            iconSize="big"
            src="ListChat"
         />
         <ProfilePreview
            username="kien109"
            name="Today i feel so good"
            iconSize="big"
            src="ListChat"
         />
         <ProfilePreview
            username="kien109"
            name="Today i feel so good"
            iconSize="big"
            captionSize="big"
            src="ListChat"
         />
         <ProfilePreview
            username="kien109"
            name="Today i feel so good"
            iconSize="big"
            captionSize="big"
            src="ListChat"
         />
         <ProfilePreview
            username="kien109"
            name="Today i feel so good"
            iconSize="big"
            captionSize="big"
            src="ListChat"
         />
         <ProfilePreview
            username="kien109"
            name="Today i feel so good"
            iconSize="big"
            captionSize="big"
            src="ListChat"
         />
      </div>
   );
};

export default ListChat;
