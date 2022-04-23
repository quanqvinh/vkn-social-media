import React, { useState } from "react";
import Header from "../Header/Header";
import "./inbox.scss";
import ListChat from "./ListChat/ListChat";
import { ReactComponent as NewInbox } from "../../assets/images/newInbox.svg";
import { ReactComponent as InboxIcon } from "../../assets/images/inbox_outline.svg";
import ChatRoom from "./ChatRoom/ChatRoom";
const Inbox = () => {
   const [isInBoxEmpty, setIsInboxEmpty] = useState(true);

   const chooseRoom = () => {
      setIsInboxEmpty(false);
   };
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
                  <ListChat chooseRoom={chooseRoom} />
               </div>
               {isInBoxEmpty ? (
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
                     <ChatRoom />
                  </>
               )}
            </div>
         </div>
      </>
   );
};

export default Inbox;
