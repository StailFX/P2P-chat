import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [], 
  isDragging: false, 
  error: null, 
};

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    addOutgoingFile: (state, action) => {
      state.list.push({ ...action.payload, direction: 'outgoing', progress: 0, status: 'pending' });
    },
    addIncomingFile: (state, action) => {
      state.list.push({ ...action.payload, direction: 'incoming', progress: 0, status: 'receiving' });
    },
    updateFileProgress: (state, action) => {
      const file = state.list.find(f => f.id === action.payload.id);
      if (file) file.progress = action.payload.progress;
    },
    updateFileStatus: (state, action) => {
      const file = state.list.find(f => f.id === action.payload.id);
      if (file) {
        file.status = action.payload.status;
        if (action.payload.blobUrl) file.blobUrl = action.payload.blobUrl;
      }
    },
    setDragging: (state, action) => {
      state.isDragging = action.payload;
    },
    clearFiles: (state) => {
      state.list = [];
    },
    setFileError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { 
  addOutgoingFile, addIncomingFile, updateFileProgress, 
  updateFileStatus, setDragging, clearFiles, setFileError 
} = filesSlice.actions;

export default filesSlice.reducer;