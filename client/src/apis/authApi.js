import axios from "axios";
import axiosClient from "./axiosClient";

const authApi = {
   signUp: (data) => {
      const url = "/signup";
      console.log(axiosClient.post(url, data));
      return axiosClient.post(url, data);
   },

   login: (params) => {
      const url = "/login";
      return axiosClient.get(url, { params });
   },

   verify: (data) => {
      const url = "/verify";
      return axiosClient.post(url, data);
   },
};

export default authApi;
