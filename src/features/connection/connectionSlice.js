import { createSlice } from '@reduxjs/toolkit';


function createPeerId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `peer-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const initialState = {
    peerId: createPeerId(),
    remotePeerId: null,
    status: 'idle', 
    messageChannelReady: false,
    fileChannelReady: false,
    error: null,
};

const connectionSlice = createSlice({
    name: 'connection',
    initialState,
    reducers: {
        initConnection(state) {
            state.status = 'connecting';
            state.error = null;
        },

        setConnectionStatus(state, action) {
            state.status = action.payload;
        },

        setMessageChannelReady(state, action) {
            state.messageChannelReady = action.payload;
        },

        setFileChannelReady(state, action) {
            state.fileChannelReady = action.payload;
        },

        setRemotePeer(state, action) {
            state.remotePeerId = action.payload;
        },

        closeConnection(state) {
            state.remotePeerId = null;
            state.status = 'disconnected';
            state.messageChannelReady = false;
            state.fileChannelReady = false;
            state.error = null;
        },

        setConnectionError(state, action) {
            state.error = action.payload;
            state.status = 'error';
            state.messageChannelReady = false;
            state.fileChannelReady = false;
        },
    },
});

export const {
    initConnection,
    setConnectionStatus,
    setMessageChannelReady,
    setFileChannelReady,
    setRemotePeer,
    closeConnection,
    setConnectionError,
} = connectionSlice.actions;

export default connectionSlice.reducer;