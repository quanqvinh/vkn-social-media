import axiosClient from './axiosClient';

const authApi = {
    signUp: data => {
        const url = '/auth/signup';
        return axiosClient.post(url, data);
    },

    login: data => {
        const url = '/auth/login';
        return axiosClient.post(url, data);
    },

    verify: data => {
        const url = '/auth/verify-email';
        return axiosClient.patch(url, data);
    },

    requestResetPassword: data => {
        const url = '/auth/request/reset-password';
        return axiosClient.post(url, data);
    },

    resetPassword: data => {
        const url = '/auth/reset-password';
        return axiosClient.patch(url, data);
    }
};

export default authApi;
