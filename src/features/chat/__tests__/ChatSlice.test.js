import chatReducer, {
  addMessage,
  addSystemMessage,
  clearMessages,
  setInputValue,
  setSendStatus,
  setError,
} from '../chatSlice';

describe('chatSlice', () => {
  test('setInputValue меняет значение поля ввода', () => {
    const state = chatReducer(undefined, setInputValue('Привет'));

    expect(state.inputValue).toBe('Привет');
  });

  test('addMessage добавляет сообщение', () => {
    const message = {
      id: '1',
      roomId: 'TEST123',
      senderId: 'peer-1',
      senderNickname: 'Сева',
      senderAvatar: '🦊',
      senderColor: '#60a5fa',
      text: 'Привет',
      createdAt: new Date().toISOString(),
      type: 'message',
    };

    const state = chatReducer(undefined, addMessage(message));

    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].text).toBe('Привет');
  });

  test('addSystemMessage добавляет системное сообщение', () => {
    const state = chatReducer(
      undefined,
      addSystemMessage({
        roomId: 'TEST123',
        text: 'Пользователь подключился',
      }),
    );

    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].type).toBe('system');
    expect(state.messages[0].text).toBe('Пользователь подключился');
  });

  test('clearMessages очищает чат', () => {
    const stateWithMessage = chatReducer(
      undefined,
      addMessage({
        id: '1',
        roomId: 'TEST123',
        senderId: 'peer-1',
        senderNickname: 'Сева',
        senderAvatar: '🦊',
        senderColor: '#60a5fa',
        text: 'Привет',
        createdAt: new Date().toISOString(),
        type: 'message',
      }),
    );

    const clearedState = chatReducer(stateWithMessage, clearMessages());

    expect(clearedState.messages).toHaveLength(0);
    expect(clearedState.inputValue).toBe('');
  });

  test('setSendStatus меняет статус отправки', () => {
    const state = chatReducer(undefined, setSendStatus('sending'));

    expect(state.sendStatus).toBe('sending');
  });

  test('setError записывает ошибку', () => {
    const state = chatReducer(undefined, setError('Ошибка'));

    expect(state.error).toBe('Ошибка');
  });
});