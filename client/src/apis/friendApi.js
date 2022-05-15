import axiosClient from './axiosClient';
import { getCookie } from '../views/Global/cookie';

const friendApi = {
    accept: data => {
        let accessToken = getCookie('accessToken');
        let url = `/user/friends/accept-request`;
        return axiosClient.post(url, data, {
            headers: {
                'access-token': accessToken
            }
        });
    },

    decline: data => {
        let accessToken = getCookie('accessToken');
        let url = `/user/friends/decline-request`;
        return axiosClient.post(url, data, {
            headers: {
                'access-token': accessToken
            }
        });
    },

    unfriend: data => {
        let accessToken = getCookie('accessToken');
        let url = `/user/friends/unfriend`;
        return axiosClient.post(url, data, {
            headers: {
                'access-token': accessToken
            }
        });
    },

    check: params => {
        let accessToken = getCookie('accessToken');
        let url = `/user/notification/check`;
        return axiosClient.get(url, {
            params,
            headers: {
                'access-token': accessToken
            }
        });
    }
};

export default friendApi;
