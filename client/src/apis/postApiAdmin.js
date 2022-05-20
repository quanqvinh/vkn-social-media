import { getCookie } from '../views/Global/cookie';
import axiosAdmin from './axiosAdmin';
export const postApiAdmin = {
    getAll: params => {
        let url = `/posts`;
        let accessToken = getCookie('accessToken');
        return axiosAdmin.get(url, {
            params,
            headers: {
                'access-token': accessToken
            }
        });
    }
};
