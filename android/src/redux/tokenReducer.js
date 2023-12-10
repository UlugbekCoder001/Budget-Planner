import { SET_ACCESS_TOKEN } from './actions/tokenActions';

const initialState = {
  accessToken: '',
};

const tokenReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ACCESS_TOKEN:
      return {
        ...state,
        accessToken: action.payload,
      };
    default:
      return state;
  }
};

export default tokenReducer;