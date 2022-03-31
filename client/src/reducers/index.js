// root reducer tổng hợp tất cả reducers trong app
import hobbyReducer from "./hobby";
import userReducer from "./user";
import { combineReducers } from "redux";

const rootReducer = combineReducers({
   hobby: hobbyReducer,
   user: userReducer,
});

export default rootReducer;
