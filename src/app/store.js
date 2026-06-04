import { configureStore } from '@reduxjs/toolkit';
import profileReducer from '../features/profile/profileSlice';
import roomReducer from '../features/room/roomSlice';
import filesReducer from '../features/filesSlice'; //я ток что добавил

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    room: roomReducer,
    files: filesReducer, //я ток что добавил
  },
});
