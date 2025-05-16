import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  booking: null,
};

const setBooking = (state: any, action: any) => {
  state.booking = action.payload;
  state.sherpa = null;
};
const cleanBooking = (state: any) => {
  state.booking = null;
};

export default createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBooking,
    cleanBooking,
  },
});
