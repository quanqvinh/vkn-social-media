import { getCookie } from '../views/Global/cookie';
import axiosAdmin from './axiosAdmin';
export const userApiAdmin = {
    analytics: () => {
        let url = `/analytics`;
        let accessToken = getCookie('accessToken');
        return axiosAdmin.get(url, {
            headers: {
                'access-token': accessToken
            }
        });
    },

    getAll: params => {
        let url = `/users`;
        let accessToken = getCookie('accessToken');
        return axiosAdmin.get(url, {
            params,
            headers: {
                'access-token': accessToken
            }
        });
    },

    getById: id => {
        let url = `/user/${id}`;
        let accessToken = getCookie('accessToken');
        return axiosAdmin.get(url, {
            headers: {
                'access-token': accessToken
            }
        });
    },

    disable: (id, expireTime) => {
        let url = `/user/${id}/disable?expireTime=${expireTime}`;
        let accessToken = getCookie('accessToken');
        return axiosAdmin.patch(url, {
            headers: {
                'access-token': accessToken
            }
        });
    }
};
