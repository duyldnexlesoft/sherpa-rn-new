import {configureStore} from '@reduxjs/toolkit';
import userSlice from './slice/userSlice';
import bookingSlice from './slice/bookingSlice';

export default configureStore({
  reducer: {
    user: userSlice.reducer,
    booking: bookingSlice.reducer,
  },
});
