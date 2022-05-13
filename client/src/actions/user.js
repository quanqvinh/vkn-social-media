import userApi from '../apis/userApi';

export const saveUser = user => {
    return {
        type: 'SAVE_USER',
        payload: user,
    };
};

export const editUser = data => {
    return {
        type: 'EDIT',
        payload: data,
    };
};

export const fetchProfileRequest = () => {
    return async dispatch => {
        try {
            let res = await userApi.get();
            res &&
                sessionStorage.setItem('USER_INFO', JSON.stringify({ ...res }));
            dispatch(fetchProfile(res));
        } catch (error) {
            console.log(error.message);
        }
    };
};

export const fetchProfile = user => {
    return {
        type: 'FETCH_PROFILE',
        payload: user,
    };
};

export const fetchUser = user => {
    return {
        type: 'FETCH_USER',
        payload: user,
    };
};
