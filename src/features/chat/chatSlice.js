import { createSlice } from '@reduxjs/toolkit';
import { createId }  from '../../utils/createId';

export const MAX_MESSAGE_LENGTH = 2000;

const initialState = {
    messages: [],
    inputValue: '',
    sendStatus: 'idle',
    error: null,
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setInputValue(state, action) {
            state.inputValue = action.payload;
            state.error = null;
        },

        addMessage(state, action) {
            state.messages.push(action.payload);
            state.sendStatus = 'success';
            state.error = null;
        },

        addSystemMessage(state, action) {
            const { roomId, text } = action.payload;

            state.messages.push({
                id: createId('system'),
                roomId,
                senderId: 'system',
                senderName: 'System',
                senderAvatar: '🧠',
                senderColor: '#9ca3fa',
                text,
                createdAt: new Date().toISOString(),
                type: 'system',
            });
        },

        clearMessages(state) {
            state.messages = [];
            state.inputValue = '';
            state.sendStatus = 'idle';
            state.error = null;
        },

        setSendStatus(state, action) {
            state.sendStatus = action.payload;
        },

        setError(state, action) {
            state.error = action.payload;
            state.sendStatus = 'error';
        },
    },
});

export const {
    setInputValue,
    addMessage,
    addSystemMessage,
    clearMessages,
    setSendStatus,
    setError,
} = chatSlice.actions;

export default chatSlice.reducer;