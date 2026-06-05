import { configureStore } from '@reduxjs/toolkit';
import profileReducer from '../features/profile/profileSlice';
import roomReducer from '../features/room/roomSlice';
import chatReducer from '../features/chat/chatSlice';
import connectionReducer from '../features/connection/connectionSlice';
import filesReducer from '../features/files/filesSlice';

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    room: roomReducer,
    chat: chatReducer,
    connection: connectionReducer,
    files: filesReducer,
  },
});
