import userApi from "../apis/userApi";

export const fetchNotifications = (notifications) => {
   return {
      type: "FETCH",
      payload: notifications,
   };
};

export const fetchNotificationsRequest = () => {
   return async (dispatch) => {
      try {
         let res = await userApi.getAllNotifications();
         let notifications = await JSON.parse(
            sessionStorage.getItem("NOTIFICATIONS")
         );
         sessionStorage.setItem(
            "NOTIFICATIONS",
            JSON.stringify({
               ...notifications,
               listNotifications: [...res.data],
            })
         );

         dispatch(fetchNotifications(res.data));
      } catch (error) {
         console.log(error.message);
      }
   };
};

export const addNotifications = (notification) => {
   console.log("add");
   return {
      type: "ADD",
      payload: notification,
   };
};
