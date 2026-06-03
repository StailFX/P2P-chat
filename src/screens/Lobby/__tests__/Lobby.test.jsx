import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Lobby } from '../Lobby';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';

function LocationProbe() {
  const loc = useLocation();
  return <div data-testid="location">{loc.pathname}</div>;
}

const renderLobby = (opts) =>
  renderWithProviders(
    <Routes>
      <Route path="/" element={<Lobby />} />
      <Route path="/room/:roomId/chat" element={<LocationProbe />} />
    </Routes>,
    opts,
  );

beforeEach(() => {
  localStorage.clear();
});

describe('Lobby', () => {
  test('пока ник не введён — кнопка создания disabled', () => {
    renderLobby();
    expect(
      screen.getByRole('button', { name: /Создать новую комнату/i }),
    ).toBeDisabled();
  });

  test('после ввода валидного ника — кнопка активна', async () => {
    const user = userEvent.setup();
    renderLobby();
    await user.type(screen.getByLabelText('Ник'), 'Никита');
    expect(
      screen.getByRole('button', { name: /Создать новую комнату/i }),
    ).toBeEnabled();
  });

  test('создание комнаты: сохраняется профиль, добавляется recent, навигация на /room/:id/chat', async () => {
    const user = userEvent.setup();
    const { store } = renderLobby();
    await user.type(screen.getByLabelText('Ник'), 'Никита');
    await user.click(
      screen.getByRole('button', { name: /Создать новую комнату/i }),
    );

    expect(localStorage.getItem('p2pchat:profile')).toContain('Никита');

    const recent = store.getState().room.recentRooms;
    expect(recent).toHaveLength(1);
    const roomId = recent[0].roomId;

    expect(await screen.findByTestId('location')).toHaveTextContent(
      `/room/${roomId}/chat`,
    );
  });

  test('невалидный ID комнаты — показывает ошибку, не уводит со страницы', async () => {
    const user = userEvent.setup();
    renderLobby();
    await user.type(screen.getByLabelText('Ник'), 'Никита');
    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[1], '!!!');
    await user.click(screen.getByRole('button', { name: /Войти/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/ID/);
    expect(screen.queryByTestId('location')).toBeNull();
  });

  test('профиль из localStorage подгружается на маунт', async () => {
    localStorage.setItem(
      'p2pchat:profile',
      JSON.stringify({ nickname: 'Сева', avatarId: 'wolf', nicknameColor: 'red' }),
    );
    renderLobby();
    expect(await screen.findByDisplayValue('Сева')).toBeInTheDocument();
  });
});
