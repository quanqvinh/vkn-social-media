import userApi from "../apis/userApi";
import { getCookie } from "../views/Global/cookie";

let initState = {};

const accessToken = getCookie("accessToken");
const params = {
   accessToken,
};

const fetchUser = async () => {
   const res = await userApi.get(params);
   console.log(res.data);

   initState = { ...res.data };
};
fetchUser();

const userReducer = (state = initState, action) => {
   switch (action.type) {
      case "SAVE_USER":
         console.log("save user");
         return (state = {
            ...action.payload,
         });

      default:
         return state;
   }
};

export default userReducer;
