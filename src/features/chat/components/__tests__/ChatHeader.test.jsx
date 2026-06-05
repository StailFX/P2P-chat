import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { ChatHeader } from '../ChatHeader';

describe('ChatHeader', () => {
  test('показывает roomId и статус соединения', () => {
    renderWithProviders(
      <ChatHeader
        roomId="TEST123"
        connectionStatus="connected"
        onCopyLink={() => {}}
        onLeaveRoom={() => {}}
      />,
    );

    expect(screen.getByText(/чат/i)).toBeInTheDocument();
    expect(screen.getByText('TEST123')).toBeInTheDocument();
    expect(screen.getByText('Соединение установлено')).toBeInTheDocument();
  });

  test('вызывает обработчик выхода', async () => {
    const user = userEvent.setup();
    const onLeaveRoom = jest.fn();

    renderWithProviders(
      <ChatHeader
        roomId="TEST123"
        connectionStatus="connected"
        onCopyLink={() => {}}
        onLeaveRoom={onLeaveRoom}
      />,
    );

    await user.click(screen.getByRole('button', { name: /выйти/i }));

    expect(onLeaveRoom).toHaveBeenCalledTimes(1);
  });

  test('вызывает обработчик копирования ссылки', async () => {
    const user = userEvent.setup();
    const onCopyLink = jest.fn();

    renderWithProviders(
      <ChatHeader
        roomId="TEST123"
        connectionStatus="connected"
        onCopyLink={onCopyLink}
        onLeaveRoom={() => {}}
      />,
    );

    await user.click(screen.getByRole('button', { name: /скопировать/i }));

    expect(onCopyLink).toHaveBeenCalledTimes(1);
  });
});