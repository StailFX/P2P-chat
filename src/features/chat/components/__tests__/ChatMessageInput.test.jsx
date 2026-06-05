import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { ChatMessageInput } from '../ChatMessageInput';

describe('ChatMessageInput', () => {
  test('показывает поле ввода и кнопку отправки', () => {
    renderWithProviders(
      <ChatMessageInput
        inputRef={{ current: null }}
        value=""
        error={null}
        disabled={false}
        isSendDisabled={true}
        onChange={() => {}}
        onSubmit={() => {}}
      />,
    );

    expect(screen.getByPlaceholderText('Сообщение...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /отправить/i })).toBeInTheDocument();
  });

  test('вызывает onChange при вводе текста', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    renderWithProviders(
      <ChatMessageInput
        inputRef={{ current: null }}
        value=""
        error={null}
        disabled={false}
        isSendDisabled={false}
        onChange={onChange}
        onSubmit={() => {}}
      />,
    );

    await user.type(screen.getByPlaceholderText('Сообщение...'), 'Привет');

    expect(onChange).toHaveBeenCalled();
  });

  test('вызывает onSubmit при отправке формы', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    renderWithProviders(
      <ChatMessageInput
        inputRef={{ current: null }}
        value="Привет"
        error={null}
        disabled={false}
        isSendDisabled={false}
        onChange={() => {}}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole('button', { name: /отправить/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  test('показывает ошибку', () => {
    renderWithProviders(
      <ChatMessageInput
        inputRef={{ current: null }}
        value=""
        error="Сообщение не может быть пустым"
        disabled={false}
        isSendDisabled={true}
        onChange={() => {}}
        onSubmit={() => {}}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Сообщение не может быть пустым');
  });

  test('блокирует input, если канал недоступен', () => {
    renderWithProviders(
      <ChatMessageInput
        inputRef={{ current: null }}
        value=""
        error={null}
        disabled={true}
        isSendDisabled={true}
        onChange={() => {}}
        onSubmit={() => {}}
      />,
    );

    expect(screen.getByPlaceholderText('Сообщение...')).toBeDisabled();
    expect(
      screen.getByText(/ждём второго участника/i),
    ).toBeInTheDocument();
  });
});