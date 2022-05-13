import axiosClient from './axiosClient';
import { getCookie } from '../views/Global/cookie';

const postApi = {
    getAll: params => {
        const url = '/posts';
        let accessToken = getCookie('accessToken');
        return axiosClient.get(url, {
            params,
            headers: { 'access-token': accessToken },
        });
    },

    newFeeds: () => {
        const url = '/post/new-feed';
        let accessToken = getCookie('accessToken');
        return axiosClient.get(url, {
            headers: { 'access-token': accessToken },
        });
    },

    get: id => {
        const url = `/post/${id}`;
        let accessToken = getCookie('accessToken');
        return axiosClient.get(url, {
            headers: { 'access-token': accessToken },
        });
    },

    like: postId => {
        const url = `/post/${postId}/like`;
        let accessToken = getCookie('accessToken');
        return axiosClient.patch(url, {
            headers: { 'access-token': accessToken },
        });
    },

    add: data => {
        const url = '/post/new';
        return axiosClient.post(url, data, {
            header: {
                'content-type': 'multipart/form-data',
            },
        });
    },

    delete: id => {
        const url = `/posts/${id}`;
        return axiosClient.delete(url);
    },

    update: (id, data) => {
        const url = `/posts/${id}`;
        return axiosClient.delete(url, data);
    },
};

export default postApi;
