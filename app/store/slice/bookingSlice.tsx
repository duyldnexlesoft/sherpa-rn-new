import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  booking: null,
  timeNotification: {},
};

const setBooking = (state: any, action: any) => {
  state.booking = action.payload;
  state.sherpa = null;
};
const cleanBooking = (state: any) => {
  state.booking = null;
};
const setTimeNotification = (state: any, action: {payload: any}) => {
  state.timeNotification = {time: new Date().getTime(), data: action.payload};
};

export default createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBooking,
    cleanBooking,
    setTimeNotification,
  },
});
