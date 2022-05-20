import axiosClient from './axiosClient';
import { getCookie } from '../views/Global/cookie';

const postApi = {
    getAll: params => {
        const url = '/posts';
        let accessToken = getCookie('accessToken');
        return axiosClient.get(url, {
            params,
            headers: { 'access-token': accessToken }
        });
    },

    newFeeds: () => {
        const url = '/post/new-feed';
        let accessToken = getCookie('accessToken');
        return axiosClient.get(url, {
            headers: { 'access-token': accessToken }
        });
    },

    get: id => {
        const url = `/post/${id}`;
        let accessToken = getCookie('accessToken');
        return axiosClient.get(url, {
            headers: { 'access-token': accessToken }
        });
    },

    like: postId => {
        const url = `/post/${postId}/like`;
        let accessToken = getCookie('accessToken');
        return axiosClient.patch(url, {
            headers: { 'access-token': accessToken }
        });
    },

    add: data => {
        const url = '/post/new';
        let accessToken = getCookie('accessToken');
        console.log('accessToken', accessToken);
        return axiosClient.post(url, data, {
            headers: {
                'content-type': 'multipart/form-data',
                'access-token': accessToken
            }
        });
    },

    delete: id => {
        let accessToken = getCookie('accessToken');
        console.log(accessToken);
        const url = `/post/${id}`;
        return axiosClient.delete(url, {
            headers: { 'access-token': accessToken }
        });
    },

    update: (id, data) => {
        const url = `/posts/${id}`;
        return axiosClient.delete(url, data);
    },

    report: data => {
        const url = `/post/report`;
        let accessToken = getCookie('accessToken');
        return axiosClient.post(url, data, {
            headers: { 'access-token': accessToken }
        });
    }
};

export default postApi;
