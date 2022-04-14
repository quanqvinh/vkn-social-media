let initState = {};

const userReducer = (state = initState, action) => {
   switch (action.type) {
      case "SAVE_USER":
         return (state = {
            ...action.payload,
         });
      case "FETCH_PROFILE":
         state = action.payload;
         return { ...state };
      default:
         return state;
   }
};

export default userReducer;