export const SET_ACCESS_TOKEN = 'SET_ACCESS_TOKEN';

export const setAccessToken = (token) => ({
  type: SET_ACCESS_TOKEN,
  payload: token,
});