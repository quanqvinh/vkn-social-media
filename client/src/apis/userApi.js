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
      return axiosClient.get(url);
   },
};

export default userApi;
