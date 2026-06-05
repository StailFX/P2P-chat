import { createChatMessage } from '../chatMessageFactory';

describe('createChatMessage', () => {
  test('создаёт объект сообщения с нужными полями', () => {
    const message = createChatMessage({
      roomId: 'TEST123',
      senderId: 'peer-1',
      profile: {
        nickname: 'Сева',
        avatar: '🦊',
        nicknameColor: '#60a5fa',
      },
      text: 'Привет',
    });

    expect(message.roomId).toBe('TEST123');
    expect(message.senderId).toBe('peer-1');
    expect(message.senderNickname).toBe('Сева');
    expect(message.senderAvatar).toBe('🦊');
    expect(message.senderColor).toBe('#60a5fa');
    expect(message.text).toBe('Привет');
    expect(message.type).toBe('message');
    expect(message.id).toBeTruthy();
    expect(message.createdAt).toBeTruthy();
  });
});