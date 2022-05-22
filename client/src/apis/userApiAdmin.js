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

    getAllDisable: params => {
        let url = `/users/disabled`;
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

    disable: id => {
        let url = `/user/${id}/disable`;
        let accessToken = getCookie('accessToken');
        return axiosAdmin.patch(url, {
            accessToken
        });
    },

    delete: id => {
        let url = `/user/${id}/delete`;
        let accessToken = getCookie('accessToken');
        return axiosAdmin.delete(url, {
            headers: {
                'access-token': accessToken
            }
        });
    },

    searchActive: params => {
        let url = `/users/search`;
        let accessToken = getCookie('accessToken');
        return axiosAdmin.get(url, {
            params,
            headers: {
                'access-token': accessToken
            }
        });
    },

    add: data => {
        let url = `/user/add`;
        let accessToken = getCookie('accessToken');
        return axiosAdmin.post(url, data, {
            headers: {
                'access-token': accessToken
            }
        });
    },

    changePassword: data => {
        let url = `/user/password`;
        let accessToken = getCookie('accessToken');
        return axiosAdmin.patch(url, data, {
            headers: {
                'access-token': accessToken
            }
        });
    }
};
