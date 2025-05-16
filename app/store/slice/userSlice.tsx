import {createSlice} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CURRENT_USER} from '../../utils/constants';

const initialState = {
  currentUser: null,
  sherpa: null,
};

const setSherpa = (state: any, action: any) => {
  state.sherpa = action.payload;
  state.booking = null;
};

const cleanSherpa = (state: any) => {
  state.sherpa = null;
};

const setCurrentUser = (state: any, action: any) => {
  state.currentUser = action.payload;
  if (action.payload) {
    AsyncStorage.setItem(CURRENT_USER, JSON.stringify(action.payload));
  }
};

const updateCurrentUser = (state: any, action: any) => {
  const newUser = {...state.currentUser, ...action.payload};
  state.currentUser = newUser;
  if (action.payload) {
    AsyncStorage.setItem(CURRENT_USER, JSON.stringify(newUser));
  }
};

const removeCurrentUser = (state: any) => {
  state.currentUser = null;
  AsyncStorage.removeItem(CURRENT_USER);
};

export default createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser,
    removeCurrentUser,
    updateCurrentUser,
    setSherpa,
    cleanSherpa,
  },
});
