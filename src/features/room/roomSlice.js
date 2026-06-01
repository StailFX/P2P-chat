import { createSlice } from '@reduxjs/toolkit';
import {
  loadRecentRooms,
  saveRecentRooms,
  RECENT_ROOMS_LIMIT,
} from '../../storage/localStorage';

export const ROOM_STATUS = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  IN_ROOM: 'in_room',
  ERROR: 'error',
};

export const CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  WAITING_PEER: 'waiting_peer',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  FAILED: 'failed',
};

const initialState = {
  roomId: null,
  isHost: false,
  status: ROOM_STATUS.IDLE,
  connectionStatus: CONNECTION_STATUS.DISCONNECTED,
  recentRooms: [],
  error: null,
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    joinRoom: {
      reducer(state, action) {
        const { roomId, isHost } = action.payload;
        state.roomId = roomId;
        state.isHost = !!isHost;
        state.status = ROOM_STATUS.CONNECTING;
        state.error = null;
      },
      prepare(roomId, { isHost = false } = {}) {
        return { payload: { roomId, isHost } };
      },
    },
    leaveRoom(state) {
      state.roomId = null;
      state.isHost = false;
      state.status = ROOM_STATUS.IDLE;
      state.connectionStatus = CONNECTION_STATUS.DISCONNECTED;
      state.error = null;
    },
    setRoomStatus(state, action) {
      state.status = action.payload;
    },
    setConnectionStatus(state, action) {
      state.connectionStatus = action.payload;
    },
    addRecentRoom: {
      reducer(state, action) {
        const { roomId, lastVisitedAt } = action.payload;
        const filtered = state.recentRooms.filter((r) => r.roomId !== roomId);
        filtered.unshift({ roomId, lastVisitedAt });
        state.recentRooms = filtered.slice(0, RECENT_ROOMS_LIMIT);
        saveRecentRooms(state.recentRooms);
      },
      prepare(roomId) {
        return { payload: { roomId, lastVisitedAt: Date.now() } };
      },
    },
    removeRecentRoom(state, action) {
      const roomId = action.payload;
      state.recentRooms = state.recentRooms.filter((r) => r.roomId !== roomId);
      saveRecentRooms(state.recentRooms);
    },
    loadRecentRoomsFromStorage(state) {
      const stored = loadRecentRooms();
      if (Array.isArray(stored)) {
        state.recentRooms = stored.slice(0, RECENT_ROOMS_LIMIT);
      }
    },
    setRoomError(state, action) {
      state.error = action.payload;
      state.status = ROOM_STATUS.ERROR;
    },
  },
});

export const {
  joinRoom,
  leaveRoom,
  setRoomStatus,
  setConnectionStatus,
  addRecentRoom,
  removeRecentRoom,
  loadRecentRoomsFromStorage,
  setRoomError,
} = roomSlice.actions;

export const selectRoom = (state) => state.room;
export const selectRecentRooms = (state) => state.room.recentRooms;
export const selectCurrentRoomId = (state) => state.room.roomId;

export default roomSlice.reducer;
