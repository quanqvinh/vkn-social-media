// root reducer tổng hợp tất cả reducers trong app
import hobbyReducer from "./hobby";
import userReducer from "./user";
import ThemeReducer from "./ThemeReducer";
import { combineReducers } from "redux";

const rootReducer = combineReducers({
   hobby: hobbyReducer,
   user: userReducer,
   themeReducer: ThemeReducer,
});

export default rootReducer;
