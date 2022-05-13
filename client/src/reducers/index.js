// root reducer tổng hợp tất cả reducers trong app
import userReducer from "./user";
import ThemeReducer from "./ThemeReducer";
import { combineReducers } from "redux";
import notificationReducer from "./notification";
const rootReducer = combineReducers({
   user: userReducer,
   notifications: notificationReducer,
   themeReducer: ThemeReducer,
});

export default rootReducer;
