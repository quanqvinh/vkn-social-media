import axios from 'axios';
import queryString from 'query-string';
import Qs from 'qs';

console.log(process.env.REACT_APP_API_URL_ADMIN);
const axiosAdmin = axios.create({
    baseURL: process.env.REACT_APP_API_URL_ADMIN,
    headers: {
        'content-type': 'application/json'
    },

    // dùng querystring
    paramsSerializer: params => queryString.stringify(params)
});

axiosAdmin.interceptors.request.use(async config => {
    // Handle token here ...
    config.paramsSerializer = params => {
        // Qs is already included in the Axios package
        return Qs.stringify(params, {
            arrayFormat: 'brackets',
            encode: false
        });
    };
    return config;
});

axiosAdmin.interceptors.response.use(
    response => {
        if (response?.data) {
            return response.data;
        }

        return response;
    },
    error => {
        // Handle errors
        throw error;
    }
);

export default axiosAdmin;
