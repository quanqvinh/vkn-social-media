import React from "react";
import { useState, useEffect } from "react";

const ResMessage = (props) => {
   const { resMessage, callBy } = props;
   const [noti, setNoti] = useState("");

   const listKeysSignup = ["Username", "User with", "Account"];
   const listNotiesSignup = [
      "Username already exists",
      "User with given email already exist",
      "Verification has been sent to your email",
   ];

   useEffect(() => {
      if (callBy === "Signup") {
         listKeysSignup.every((key, index) => {
            if (resMessage.includes(key)) {
               console.log(index);
               setNoti(listNotiesSignup[index]);
               console.log(listNotiesSignup[index]);
               return false;
            }
            return true;
         });
      } else {
      }
   }, [resMessage]);

   return <p className="res-message">{noti}</p>;
};

export default ResMessage;
