import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { ChatMessageItem } from '../ChatMessageItem';

describe('ChatMessageItem', () => {
  test('отображает обычное сообщение', () => {
    renderWithProviders(
      <ChatMessageItem
        isOwn={false}
        message={{
          id: '1',
          roomId: 'TEST123',
          senderId: 'peer-1',
          senderNickname: 'Сева',
          senderAvatar: '🦊',
          senderColor: '#60a5fa',
          text: 'Привет',
          createdAt: new Date().toISOString(),
          type: 'message',
        }}
      />,
    );

    expect(screen.getByText('Сева')).toBeInTheDocument();
    expect(screen.getByText('🦊')).toBeInTheDocument();
    expect(screen.getByText('Привет')).toBeInTheDocument();
  });

  test('отображает системное сообщение', () => {
    renderWithProviders(
      <ChatMessageItem
        isOwn={false}
        message={{
          id: 'system-1',
          roomId: 'TEST123',
          senderId: 'system',
          senderNickname: 'System',
          senderAvatar: '⚙️',
          senderColor: '#9ca3af',
          text: 'Пользователь подключился',
          createdAt: new Date().toISOString(),
          type: 'system',
        }}
      />,
    );

    expect(screen.getByText('Пользователь подключился')).toBeInTheDocument();
  });
});