import React, { useCallback, useEffect } from "react";
import ProfilePreview from "../../Profile/ProfilePreview/ProfilePreview";
import { ReactComponent as Option } from "../../../assets/images/report.svg";
import { ReactComponent as AddImage } from "../../../assets/images/addImg.svg";
import "./chatroom.scss";
import avatar from "../../../assets/images/profile.jpg";
import { SOCKET } from "../../../App";
import { useState, useContext } from "react";
import { useSelector } from "react-redux";
import { memo } from "react";

const ChatRoom = (props) => {
   const user = useSelector((state) => state.user);
   const { handelLastestMessage, currentRoom } = props;
   const [inputing, setInputing] = useState(false);
   const [inputContent, setInputContent] = useState("");
   const [listMessage, setListMessage] = useState([]);

   const socket = useContext(SOCKET);

   const sendMessage = useCallback(() => {
      socket.emit("chat:send_message", {
         username: currentRoom.chatMate.username,
         roomId: currentRoom.roomId,
         content: inputContent,
         userId: user._id,
      });

      setListMessage([
         ...listMessage,
         {
            content: inputContent,
            img: null,
            isMine: true,
         },
      ]);
      handelLastestMessage(currentRoom.roomId, inputContent);
      setInputContent("");
   }, [listMessage, inputContent]);

   useEffect(() => {
      socket.once("chat:print_message", ({ message }) => {
         setListMessage([...listMessage, message]);
      });
   }, [listMessage]);

   const handelSendMessage = () => {
      try {
         sendMessage();
      } catch (error) {
         console.log(error.message);
      }
   };

   const handelKeyUp = (e) => {
      if (e.keyCode === 13) {
         try {
            sendMessage();
         } catch (error) {
            console.log(error.message);
         }
      }
   };

   const handelSendImage = useCallback(
      (e) => {
         const image = e.target.files[0];
         const reader = new FileReader();
         reader.onloadend = () => {
            socket.emit("chat:send_image", {
               image: reader.result,
               username: currentRoom.chatMate.username,
               roomId: currentRoom.roomId,
               userId: user._id,
            });
         };
         reader.readAsDataURL(image);

         var binaryData = [];
         binaryData.push(image);
         let imgSrc = window.URL.createObjectURL(
            new Blob(binaryData, { type: "application/zip" })
         );

         setListMessage([
            ...listMessage,
            {
               content: null,
               img: imgSrc,
               isMine: true,
            },
         ]);
         handelLastestMessage(currentRoom.roomId, inputContent);
         setInputContent("");
      },
      [listMessage, inputContent]
   );

   return (
      <div className="chat-room">
         <div className="header">
            <ProfilePreview
               username={currentRoom.chatMate.username}
               iconSize="small"
               captionSize="big"
            />
            <Option className="header__icon" />
         </div>

         <div className="content">
            {listMessage?.length > 0 &&
               listMessage.map((message, index) => (
                  <div className="content__day" key={index}>
                     {/* <p className="content__day-time">
                        July 10, 2021, 11:27 am
                     </p> */}
                     {message.isMine ? (
                        message.content !== null ? (
                           <p className="content__day-message">
                              {message.content}
                           </p>
                        ) : (
                           <div className="content__day-img">
                              <img src={message.img} alt="img" />
                           </div>
                        )
                     ) : (
                        <div className="content__day-partner">
                           <div className="content__day-partner-avatar">
                              <img src={avatar} alt="" />
                           </div>
                           <p className="content__day-message">
                              {message.content}
                           </p>
                        </div>
                     )}
                  </div>
               ))}
         </div>

         <div className="chat-footer">
            <div
               className={`input ${!inputing ? "input--blur" : ""} ${
                  inputContent !== "" ? "input--has-content" : ""
               }`}
            >
               <input
                  type="text"
                  placeholder="Message"
                  onFocus={() => setInputing(true)}
                  onChange={(e) => setInputContent(e.target.value)}
                  onKeyUp={(e) => handelKeyUp(e)}
                  value={inputContent}
               />
               <input
                  type="file"
                  hidden
                  name=""
                  id="input__choose-img"
                  accept="image/*"
                  onChange={(e) => handelSendImage(e)}
               />
               <label htmlFor="input__choose-img">
                  <AddImage />
               </label>
               <span className="input__send" onClick={sendMessage}>
                  Send
               </span>
            </div>
         </div>
      </div>
   );
};

export default memo(ChatRoom);
