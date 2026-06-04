export const selectPeerId = (state) => state.connection.peerId;

export const selectRemotePeerId = (state) => state.connection.remotePeerId;

export const selectConnectionStatus = (state) => state.connection.status;

export const selectMessageChannelReady = (state) =>
  state.connection.messageChannelReady;

export const selectFileChannelReady = (state) =>
  state.connection.fileChannelReady;

export const selectConnectionError = (state) => state.connection.error;