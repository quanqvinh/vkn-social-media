import axiosClient from "./axiosClient";
import { getCookie } from "../views/Global/cookie";

const userApi = {
   get: (params) => {
      const url = `/user/me/profile`;
      let accessToken = getCookie("accessToken");
      return axiosClient.get(url, {
         params,
         headers: { "access-token": accessToken },
      });
   },

   getRooms: () => {
      const url = "/room";
      let accessToken = getCookie("accessToken");
      return axiosClient.get(url, {
         headers: {
            "access-token": accessToken,
         },
      });
   },

   getRoomById: (roomId, params) => {
      const url = `/room/${roomId}`;
      return axiosClient.get(url, {
         params,
      });
   },

   getById: (userId) => {
      const url = `user/${userId}`;
      return axiosClient.get(url);
   },

   changeAvatar: (data) => {
      const url = "/user/upload/avatar";
      let accessToken = getCookie("accessToken");
      console.log("token in userapi", accessToken);
      return axiosClient.post(url, data, {
         headers: {
            "content-type": "multipart/form-data",
            "access-token": accessToken,
         },
      });
   },
};

export default userApi;
