import userApi from '../apis/userApi';

export const fetchNotifications = notifications => {
    return {
        type: 'FETCH',
        payload: notifications
    };
};

export const fetchNotificationsRequest = uncheck => {
    return async dispatch => {
        try {
            let res = await userApi.getAllNotifications();

            sessionStorage.setItem(
                'NOTIFICATIONS',
                JSON.stringify({
                    uncheck,
                    listNotifications: [...res.data]
                })
            );

            console.log('fetch request');
            dispatch(
                fetchNotifications({
                    uncheck,
                    listNotifications: [...res.data]
                })
            );
        } catch (error) {
            console.log(error.message);
        }
    };
};

export const addNotifications = notification => {
    return {
        type: 'ADD',
        payload: notification
    };
};

export const checkNotifications = nId => {
    return {
        type: 'CHECK',
        payload: nId
    };
};
