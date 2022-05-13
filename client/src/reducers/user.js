let initState = sessionStorage.getItem('USER_INFO')
    ? JSON.parse(sessionStorage.getItem('USER_INFO'))
    : {};

const userReducer = (state = initState, action) => {
   switch (action.type) {
      case "SAVE_USER":
         return (state = {
            ...action.payload,
         });
      case "FETCH_PROFILE":
         state = action.payload;
         return { ...state };
      case "EDIT":
         let newState = state;
         newState = { ...newState, ...action.payload };
         sessionStorage.setItem("USER_INFO", JSON.stringify(newState));
         return newState;
      default:
         return state;
   }
};

export default userReducer;
