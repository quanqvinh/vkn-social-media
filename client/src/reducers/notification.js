const initState = sessionStorage.getItem('NOTIFICATIONS')
    ? JSON.parse(sessionStorage.getItem('NOTIFICATIONS'))
    : {};

let newState = {};
const notificationReducer = (state = initState, action) => {
    switch (action.type) {
        case 'FETCH':
            return { ...state, ...action.payload };
        case 'ADD':
            newState = {
                ...state,
                uncheck: state.uncheck + 1,
                listNotifications: [...state.listNotifications, action.payload]
            };
            sessionStorage.setItem('NOTIFICATIONS', JSON.stringify(newState));
            return newState;
        case 'CHECK':
            let newListNotifications = state.listNotifications.filter(
                noti => noti._id !== action.payload
            );
            newState = {
                ...state,
                uncheck: state.uncheck - 1,
                listNotifications: [...newListNotifications]
            };
            sessionStorage.setItem('NOTIFICATIONS', JSON.stringify(newState));
            return newState;
        default:
            return state;
    }
};

export default notificationReducer;
