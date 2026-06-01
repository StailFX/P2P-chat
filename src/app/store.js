import { configureStore } from '@reduxjs/toolkit';
import profileReducer from '../features/profile/profileSlice';
import roomReducer from '../features/room/roomSlice';

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    room: roomReducer,
  },
});
