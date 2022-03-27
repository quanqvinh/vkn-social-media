import React from "react";
import { useState, useEffect } from "react";

const ResMessage = (props) => {
   const { resMessage, callBy } = props;
   const [noti, setNoti] = useState("");
   const listKeys = ["Username", "User with", "Account"];
   const listNoties = [
      "Username already exists",
      "User with given email already exist",
      "Account is created",
   ];

   useEffect(() => {
      if (callBy === "Signup") {
         listKeys.every((key, index) => {
            if (resMessage.includes(key)) {
               setNoti(listNoties[index]);
               return false;
            }
         });
      } else {
      }
   }, [resMessage]);

   return <p>hello</p>;
};

export default ResMessage;
