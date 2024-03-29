import { combineReducers } from 'redux';
import tokenReducer from './tokenReducer';

const rootReducer = combineReducers({
  token: tokenReducer,
});

export default rootReducer;