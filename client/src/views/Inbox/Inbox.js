import React, { useState, useContext, useCallback } from "react";
import Header from "../Header/Header";
import "./inbox.scss";
import ListChat from "./ListChat/ListChat";
import { ReactComponent as NewInbox } from "../../assets/images/newInbox.svg";
import { ReactComponent as InboxIcon } from "../../assets/images/inbox_outline.svg";
import ChatRoom from "./ChatRoom/ChatRoom";
import { SOCKET } from "../../App";
const Inbox = () => {
   const [latestMessage, setLatestMessage] = useState({
      payload: {},
      content: "",
   });
   const [currentRoom, setCurrentRoom] = useState({
      chatMate: null,
      room: null,
   });

   const socket = useContext(SOCKET);

   const handelLastestMessage = useCallback(
      (roomId, content) => {
         setLatestMessage({
            roomId,
            content,
         });
      },
      [latestMessage]
   );

   socket.once("chat:print_message", (payload) => {
      handelLastestMessage(payload.roomId, payload.content);
   });

   const getToRoom = useCallback(
      (room) => {
         setCurrentRoom({
            chatMate: room.chatMate,
            roomId: room.roomId,
         });
      },
      [currentRoom]
   );

   return (
      <>
         <Header />
         <div className="inbox-container">
            <div className="inbox-container__content">
               <div className="nav-left">
                  <div className="nav-left__header">
                     <h2 className="nav-left__header-username">kien108</h2>
                     <NewInbox />
                  </div>
                  <ListChat
                     getToRoom={getToRoom}
                     latestMessage={latestMessage}
                  />
               </div>
               {currentRoom.chatMate === null ? (
                  <div className="nav-right">
                     <span className="nav-right__wrap-icon">
                        <InboxIcon className="nav-right__wrap-icon-svg" />
                     </span>
                     <h2 className="nav-right__title">Your Messages</h2>
                     <p className="nav-right__description">
                        Send private photos and messages to a friend or group.
                     </p>
                     <button className="nav-right__btnSend">
                        Send Message
                     </button>
                  </div>
               ) : (
                  <>
                     <ChatRoom
                        handelLastestMessage={handelLastestMessage}
                        currentRoom={currentRoom}
                     />
                  </>
               )}
            </div>
         </div>
      </>
   );
};

export default Inbox;
