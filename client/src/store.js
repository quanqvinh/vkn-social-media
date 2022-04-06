import rootReducer from "./reducers/index";
import { createStore } from "redux";

// Tạo store với rootReducer(chứa tất cả reducers)
const store = createStore(rootReducer);
export default store;
