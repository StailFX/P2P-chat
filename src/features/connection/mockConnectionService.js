export function createMockConnection({
    roomId,
    peerId,
    profile,
    handlers = {},
}) {
    const channel = new BroadcastChannel(`p2p-room-${roomId}`);

    channel.onmessage = (event) => {
        const data = event.data;

        if (!data) return;

        if (data.senderPeerId === peerId) return;

        switch (data.type) {
            case 'USER_JOINED':
                handlers.onUserJoined?.(data);
                break;
            case 'USER_LEFT':
                handlers.onUserLeft?.(data);
                break;
            case 'CHAT_MESSAGE':
                handlers.onMessage?.(data);
                break;
            case 'FILE_EVENT':
                handlers.onFileEvent?.(data);
                break;

            default:
                break;
        }
    };

    channel.postMessage({
        type: 'USER_JOINED',
        senderPeerId: peerId,
        payload: {
            peerId,
            roomId,
            profile,
            createdAt: new Date().toISOString(),
        },
    });

    return {
        sendMessage: (message) => {
            channel.postMessage({
                type: 'CHAT_MESSAGE',
                senderPeerId: peerId,
                payload: message,
            });
        },

        sendFileEvent: (payload) => {
            channel.postMessage({
                type: 'FILE_EVENT',
                senderPeerId: peerId,
                payload,
            });
        },

        disconnect: () => {
            channel.postMessage({
                type: 'USER_LEFT',
                senderPeerId: peerId,
                payload: {
                    peerId,
                    roomId,
                    profile,
                    createdAt: new Date().toISOString(),
                }
            });

            channel.close();
        },

    }
}