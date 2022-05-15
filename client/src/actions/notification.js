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

            console.log('fetch init');
            sessionStorage.setItem(
                'NOTIFICATIONS',
                JSON.stringify({
                    uncheck,
                    listNotifications: [...res.data]
                })
            );

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
    console.log('add notification action', notification);
    return {
        type: 'ADD',
        payload: formatNotifications(notification)
    };
};

const formatNotifications = noti => {
    let notiFormat = {};
    switch (noti.type) {
        case 'add_friend_request':
            notiFormat = {
                ...noti,
                content: 'sent a add friend request'
            };
            break;
        case 'react_post':
            notiFormat = {
                ...noti,
                content: 'liked your post'
            };
            break;
        case 'react_comment':
            notiFormat = {
                ...noti,
                content: 'liked your comment'
            };
            break;
        case 'comment':
            notiFormat = {
                ...noti,
                content: 'sent a comment in your post'
            };
            break;
        case 'reply':
            notiFormat = {
                ...noti,
                content: 'sent a reply your comment'
            };
            break;
        default:
            break;
    }
    return notiFormat;
};
export const checkNotifications = nId => {
    return {
        type: 'CHECK',
        payload: nId
    };
};

// export const formatNotifications = notifications => {
//     console.log('format');
//     sessionStorage.setItem(
//         'NOTIFICATIONS',
//         JSON.stringify({ ...notifications })
//     );

//     return {
//         type: 'FORMAT',
//         payload: notifications
//     };
// };
