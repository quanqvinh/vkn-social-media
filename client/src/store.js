import rootReducer from './reducers/index';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

// Tạo store với rootReducer(chứa tất cả reducers)
const store = createStore(rootReducer, applyMiddleware(thunk));
export default store;
