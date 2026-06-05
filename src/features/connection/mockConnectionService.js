export function createMockConnection({
  roomId,
  peerId,
  profile,
  handlers = {},
}) {
  const channel = new BroadcastChannel(`p2p-room-${roomId}`);

  const safeProfile = {
    nickname: profile?.nickname || 'Пользователь',
    avatar: profile?.avatar || profile?.avatarId || '🦊',
    nicknameColor: profile?.nicknameColor || '#60a5fa',
  };

  const createUserPayload = () => ({
    peerId,
    roomId,
    profile: safeProfile,
    createdAt: new Date().toISOString(),
  });

  const sendEvent = (type, payload) => {
    channel.postMessage({
      type,
      senderPeerId: peerId,
      payload,
    });
  };

  channel.onmessage = (event) => {
    const data = event.data;

    if (!data) {
      return;
    }

    if (data.senderPeerId === peerId) {
      return;
    }

    switch (data.type) {
      case 'USER_JOINED':
        handlers.onUserJoined?.(data.payload);

        sendEvent('USER_ACK', createUserPayload());
        break;

      case 'USER_ACK':
        handlers.onUserJoined?.(data.payload);
        break;

      case 'USER_LEFT':
        handlers.onUserLeft?.(data.payload);
        break;

      case 'CHAT_MESSAGE':
        handlers.onMessage?.(data.payload);
        break;

      case 'FILE_EVENT':
        handlers.onFileEvent?.(data.payload);
        break;

      default:
        break;
    }
  };

  sendEvent('USER_JOINED', createUserPayload());

  return {
    sendMessage(message) {
      sendEvent('CHAT_MESSAGE', message);
    },

    sendFileEvent(payload) {
      sendEvent('FILE_EVENT', payload);
    },

    disconnect() {
      sendEvent('USER_LEFT', createUserPayload());
      channel.close();
    },
  };
}