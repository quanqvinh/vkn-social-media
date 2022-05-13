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
      let accessToken = getCookie("accessToken");
      const url = `/room/${roomId}`;
      return axiosClient.get(url, {
         headers: {
            "access-token": accessToken,
         },
         params,
      });
   },

   getById: (userId) => {
      let accessToken = getCookie("accessToken");
      const url = `user/${userId}`;
      return axiosClient.get(url, {
         headers: {
            "access-token": accessToken,
         },
      });
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

   edit: (data) => {
      const url = `/user/edit/info`;
      let accessToken = getCookie("accessToken");
      return axiosClient.patch(url, {
         headers: {
            "access-token": accessToken,
         },
         ...data,
      });
   },

   editPassword: (data) => {
      const url = `/user/edit/password`;
      return axiosClient.patch(url, { ...data });
   },

   requestEditEmail: (data) => {
      const url = `/user/edit/email/request`;
      return axiosClient.post(url, { ...data });
   },

   editEmail: (token) => {
      let accessToken = getCookie("accessToken");
      const url = `/user/edit/email`;
      return axiosClient.patch(url, {
         headers: {
            "access-token": accessToken,
         },
         token,
      });
   },

   search: (params) => {
      let accessToken = getCookie("accessToken");
      const url = `/user/search`;
      return axiosClient.get(url, {
         params,
         headers: {
            "access-token": accessToken,
         },
      });
   },

   getAllNotifications: () => {
      let accessToken = getCookie("accessToken");

      const url = `/user/notifications`;
      return axiosClient.get(url, {
         headers: {
            "access-token": accessToken,
         },
      });
   },
};

export default userApi;
