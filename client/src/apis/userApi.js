import axiosClient from "./axiosClient";

const data = {
   name: "kien108",
   age: 18,
};
const userApi = {
   get: (params) => {
      const url = `/user`;
      return axiosClient.get(url, params);
   },
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
