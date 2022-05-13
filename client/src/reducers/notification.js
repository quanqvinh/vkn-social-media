const initState = sessionStorage.getItem("NOTIFICATIONS")
   ? JSON.parse(sessionStorage.getItem("NOTIFICATIONS"))
   : {};

const notificationReducer = (state = initState, action) => {
   switch (action.type) {
      case "FETCH":
         console.log(initState);
         state = {
            ...state,
            listNotifications: [...action.payload],
         };
         return state;
      case "ADD":
         let newState = state;
         console.log(state);
         newState = {
            ...newState,
            uncheck: newState.uncheck + 1,
            listNotifications: [...newState.listNotifications, action.payload],
         };
         sessionStorage.setItem("NOTIFICATIONS", JSON.stringify(newState));
         return newState;
      default:
         return state;
   }
};

export default notificationReducer;
