import axiosClient from "./axiosClient";
import { getCookie } from "../views/Global/cookie";

const accessToken = getCookie("accessToken") ? getCookie("accessToken") : null;

const userApi = {
   get: (params) => {
      const url = `/user/me/profile`;
      return axiosClient.get(url, { params });
   },

   // get: (params) => {
   //    const url = `/user/me/profile`;
   //    const extraParams = { ...params, test };
   //    console.log(extraParams);
   //    return axiosClient.get(url, { params: extraParams });
   // },
   // get: (params) => {
   //    const url = `/user`;
   //    return axiosClient({
   //       method: "POST",
   //       url,
   //       data,
   //       params,
   //       headers: {
   //          "content-type": "multipart/form-data",
   //       },
   //    });
   // },
};

export default userApi;
