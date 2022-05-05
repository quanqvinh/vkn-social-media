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

   const listKeysLogin = ["Username", "Password"];
   const listNotiesLogin = [
      "Username or email is incorrect",
      "Your password is incorrect",
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
         listKeysLogin.every((key, index) => {
            if (resMessage.includes(key)) {
               console.log(index);
               setNoti(listNotiesLogin[index]);
               console.log(listNotiesLogin[index]);
               return false;
            }
            return true;
         });
      }
   }, [resMessage]);

   return <p className="res-message">{noti}</p>;
};

export default ResMessage;
