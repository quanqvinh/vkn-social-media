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
               console.log(index);
               setNoti(listNoties[index]);
               console.log(listNoties[index]);
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
