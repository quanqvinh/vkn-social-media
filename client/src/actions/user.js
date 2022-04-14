import userApi from "../apis/userApi";

export const saveUser = (user) => {
   return {
      type: "SAVE_USER",
      payload: user,
   };
};

export const fetchProfileRequest = () => {
   return async (dispatch) => {
      console.log("fetch request");
      let res = await userApi.get();
      dispatch(fetchProfile(res));
   };
};

export const fetchProfile = (user) => {
   console.log("fetch profile");
   return {
      type: "FETCH_PROFILE",
      payload: user,
   };
};

export const fetchUser = (user) => {
   return {
      type: "FETCH_USER",
      payload: user,
   };
};
