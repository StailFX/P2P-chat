import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Files } from '../Files';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';

// mockConnectionService открывает BroadcastChannel — в тестах он не нужен,
// подменяем на заглушку. Префикс mock* обязателен для jest.mock-фабрики.
const mockSendFileEvent = jest.fn();
const mockDisconnect = jest.fn();
jest.mock('../../../features/connection/mockConnectionService', () => ({
  createMockConnection: jest.fn(() => ({
    sendMessage: jest.fn(),
    sendFileEvent: (...args) => mockSendFileEvent(...args),
    disconnect: (...args) => mockDisconnect(...args),
  })),
}));

// Тяжёлую часть передачи файла гасим: сам алгоритм покрыт тестами fileTransfer.
jest.mock('../../../utils/fileTransfer', () => {
  const actual = jest.requireActual('../../../utils/fileTransfer');
  return {
    ...actual,
    sendFileInChunks: jest.fn(async (file, fileId, onChunk, onProgress) => {
      onChunk({ type: 'file-start', fileId, name: file.name, size: file.size });
      onChunk({ type: 'file-chunk', fileId, data: 'aGVsbG8=' });
      onProgress(50);
      onChunk({ type: 'file-end', fileId });
      onProgress(100);
    }),
  };
});

function LocationProbe() {
  const loc = useLocation();
  return <div data-testid="location">{loc.pathname}</div>;
}

const renderFiles = () =>
  renderWithProviders(
    <Routes>
      <Route path="/room/:roomId/files" element={<Files />} />
      <Route path="/" element={<LocationProbe />} />
    </Routes>,
    { route: '/room/abc123/files' },
  );

beforeEach(() => {
  mockSendFileEvent.mockClear();
  mockDisconnect.mockClear();
});

describe('Files screen', () => {
  test('рендерит заголовок с id комнаты и drop-зону', () => {
    renderFiles();
    expect(screen.getByRole('heading', { name: /Файлы/i })).toHaveTextContent(
      'abc123',
    );
    expect(
      screen.getByRole('button', { name: /Перетащи файлы или выбери/i }),
    ).toBeInTheDocument();
  });

  test('drag-over подсвечивает зону — сообщение меняется на "Бросай сюда"', () => {
    renderFiles();
    const zone = screen.getByRole('button', { name: /Перетащи файлы или выбери/i });
    fireEvent.dragOver(zone);
    expect(screen.getByText(/Бросай сюда/i)).toBeInTheDocument();
    fireEvent.dragLeave(zone);
    expect(
      screen.getByText(/Перетащи файлы или нажми/i),
    ).toBeInTheDocument();
  });

  test('drop файла добавляет элемент в список и шлёт по каналу', async () => {
    renderFiles();
    const zone = screen.getByRole('button', { name: /Перетащи файлы или выбери/i });
    const file = new File(['payload'], 'doc.txt', { type: 'text/plain' });

    fireEvent.drop(zone, { dataTransfer: { files: [file] } });

    expect(await screen.findByText('doc.txt')).toBeInTheDocument();

    // progressbar появился с aria-value*
    const progress = await screen.findByRole('progressbar', {
      name: /Прогресс doc\.txt/,
    });
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');

    // канал получил file-start
    await screen.findByText('doc.txt');
    const calledTypes = mockSendFileEvent.mock.calls.map((c) => c[0].type);
    expect(calledTypes).toContain('file-start');
    expect(calledTypes).toContain('file-end');
  });

  test('"Выйти в лобби" возвращает на /', async () => {
    const user = userEvent.setup();
    renderFiles();
    await user.click(screen.getByRole('button', { name: /Выйти в лобби/i }));
    expect(screen.getByTestId('location')).toHaveTextContent('/');
  });

  test('при размонтировании канал закрывается', () => {
    const { unmount } = renderFiles();
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
