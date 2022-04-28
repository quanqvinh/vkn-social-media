import axiosClient from "./axiosClient";
import { getCookie } from "../views/Global/cookie";

const userApi = {
   get: (params) => {
      const url = `/user/me/profile`;
      return axiosClient.get(url, { params });
   },

   getRooms: () => {
      const url = "/room";
      return axiosClient.get(url);
   },
};

export default userApi;
