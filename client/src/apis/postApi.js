import axiosClient from "./axiosClient";

const postApi = {
   getAll: (params) => {
      const url = "/posts";
      return axiosClient.get(url, { params });
   },

   get: (id) => {
      const url = `/posts/${id}`;
      return axiosClient.get(url);
   },

   add: (data) => {
      const url = "/posts";
      return axiosClient.post(url, data);
   },

   delete: (id) => {
      const url = `/posts/${id}`;
      return axiosClient.delete(url);
   },

   update: (id, data) => {
      const url = `/posts/${id}`;
      return axiosClient.delete(url, data);
   },
};

export default postApi;
