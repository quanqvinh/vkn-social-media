import React from "react";
import ProfilePreview from "../../Profile/ProfilePreview/ProfilePreview";
import { ReactComponent as Option } from "../../../assets/images/report.svg";
import { ReactComponent as AddImage } from "../../../assets/images/addImg.svg";
import "./chatroom.scss";
import img from "../../../assets/images/login1.png";

import { useState } from "react";

const ChatRoom = () => {
   const [inputing, setInputing] = useState(false);
   const [inputContent, setInputContent] = useState("");

   return (
      <div className="chat-room">
         <div className="header">
            <ProfilePreview
               username="kien108"
               iconSize="small"
               captionSize="big"
            />
            <Option className="header__icon" />
         </div>

         <div className="content">
            <div className="content__day">
               <p className="content__day-time">July 10, 2021, 11:27 am</p>
               <p className="content__day-message">Hello</p>
               <div className="content__day-img">
                  <img src={img} alt="img" />
               </div>
            </div>

            <div className="content__day">
               <p className="content__day-time">July 10, 2021, 11:27 am</p>
               <p className="content__day-message">Hello</p>
               <div className="content__day-img">
                  <img src={img} alt="img" />
               </div>
            </div>

            <div className="content__day">
               <p className="content__day-time">July 10, 2021, 11:27 am</p>
               <p className="content__day-message">Hello</p>
               <div className="content__day-img">
                  <img src={img} alt="img" />
               </div>
            </div>

            <div className="content__day">
               <p className="content__day-time">July 10, 2021, 11:27 am</p>
               <p className="content__day-message">
                  Lorem ipsum dolor sit amet consectetur, adipisicing elit. A
                  tenetur at minus asperiores. Eaque doloribus, commodi
                  voluptatem, delectus qui accusantium ipsa ducimus tempora
                  aperiam neque expedita. Quas ea cum praesentium?
               </p>
               <div className="content__day-img">
                  <img src={img} alt="img" />
               </div>
            </div>
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
                  onBlur={() => setInputing(!inputing)}
                  onChange={(e) => setInputContent(e.target.value)}
                  value={inputContent}
               />
               <input
                  type="file"
                  hidden
                  name=""
                  id="input__choose-img"
                  accept="image/*"
               />
               <label htmlFor="input__choose-img">
                  <AddImage />
               </label>
               <span className="input__send">Send</span>
            </div>
         </div>
      </div>
   );
};

export default ChatRoom;
