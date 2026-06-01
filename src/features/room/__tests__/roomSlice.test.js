import reducer, {
  joinRoom,
  leaveRoom,
  setRoomStatus,
  setConnectionStatus,
  addRecentRoom,
  removeRecentRoom,
  loadRecentRoomsFromStorage,
  setRoomError,
  ROOM_STATUS,
  CONNECTION_STATUS,
  selectRecentRooms,
  selectCurrentRoomId,
} from '../roomSlice';
import { saveRecentRooms, RECENT_ROOMS_LIMIT } from '../../../storage/localStorage';

beforeEach(() => {
  localStorage.clear();
});

const initial = () => reducer(undefined, { type: '@@INIT' });

describe('initial state', () => {
  test('idle, без комнаты, пустой recentRooms', () => {
    const s = initial();
    expect(s.roomId).toBeNull();
    expect(s.status).toBe(ROOM_STATUS.IDLE);
    expect(s.connectionStatus).toBe(CONNECTION_STATUS.DISCONNECTED);
    expect(s.recentRooms).toEqual([]);
  });
});

describe('joinRoom / leaveRoom', () => {
  test('joinRoom выставляет roomId, isHost и статус CONNECTING', () => {
    const s = reducer(initial(), joinRoom('abc123', { isHost: true }));
    expect(s.roomId).toBe('abc123');
    expect(s.isHost).toBe(true);
    expect(s.status).toBe(ROOM_STATUS.CONNECTING);
  });

  test('joinRoom без isHost — по умолчанию false', () => {
    const s = reducer(initial(), joinRoom('abc123'));
    expect(s.isHost).toBe(false);
  });

  test('leaveRoom сбрасывает всё, кроме recentRooms', () => {
    let s = reducer(initial(), joinRoom('abc123'));
    s = reducer(s, addRecentRoom('abc123'));
    s = reducer(s, leaveRoom());
    expect(s.roomId).toBeNull();
    expect(s.status).toBe(ROOM_STATUS.IDLE);
    expect(s.recentRooms).toHaveLength(1); // recent не трогаем
  });
});

describe('addRecentRoom', () => {
  test('добавляет комнату с lastVisitedAt', () => {
    const s = reducer(initial(), addRecentRoom('abc'));
    expect(s.recentRooms[0].roomId).toBe('abc');
    expect(typeof s.recentRooms[0].lastVisitedAt).toBe('number');
  });

  test('дубликат двигается наверх, а не плодится', () => {
    let s = reducer(initial(), addRecentRoom('a'));
    s = reducer(s, addRecentRoom('b'));
    s = reducer(s, addRecentRoom('a')); // повторно
    expect(s.recentRooms.map((r) => r.roomId)).toEqual(['a', 'b']);
  });

  test('не превышает RECENT_ROOMS_LIMIT', () => {
    let s = initial();
    for (let i = 0; i < RECENT_ROOMS_LIMIT + 3; i++) {
      s = reducer(s, addRecentRoom(`room-${i}`));
    }
    expect(s.recentRooms).toHaveLength(RECENT_ROOMS_LIMIT);
    // Самая свежая — первой.
    expect(s.recentRooms[0].roomId).toBe(`room-${RECENT_ROOMS_LIMIT + 2}`);
  });

  test('синхронизирует localStorage', () => {
    reducer(initial(), addRecentRoom('abc'));
    const raw = localStorage.getItem('p2pchat:recentRooms');
    expect(raw).toContain('abc');
  });
});

describe('removeRecentRoom', () => {
  test('убирает по id и пишет в localStorage', () => {
    let s = reducer(initial(), addRecentRoom('a'));
    s = reducer(s, addRecentRoom('b'));
    s = reducer(s, removeRecentRoom('a'));
    expect(s.recentRooms.map((r) => r.roomId)).toEqual(['b']);
    expect(localStorage.getItem('p2pchat:recentRooms')).not.toContain('"a"');
  });
});

describe('loadRecentRoomsFromStorage', () => {
  test('подтягивает массив из localStorage и обрезает по лимиту', () => {
    const stored = Array.from({ length: RECENT_ROOMS_LIMIT + 5 }, (_, i) => ({
      roomId: `r-${i}`,
      lastVisitedAt: 1,
    }));
    saveRecentRooms(stored);
    const s = reducer(initial(), loadRecentRoomsFromStorage());
    expect(s.recentRooms).toHaveLength(RECENT_ROOMS_LIMIT);
  });
});

describe('setRoomStatus / setConnectionStatus / setRoomError', () => {
  test('просто проставляют поле', () => {
    let s = reducer(initial(), setRoomStatus(ROOM_STATUS.IN_ROOM));
    expect(s.status).toBe(ROOM_STATUS.IN_ROOM);
    s = reducer(s, setConnectionStatus(CONNECTION_STATUS.CONNECTED));
    expect(s.connectionStatus).toBe(CONNECTION_STATUS.CONNECTED);
    s = reducer(s, setRoomError('boom'));
    expect(s.error).toBe('boom');
    expect(s.status).toBe(ROOM_STATUS.ERROR);
  });
});

describe('селекторы', () => {
  test('selectRecentRooms / selectCurrentRoomId', () => {
    const rootState = {
      room: { ...initial(), roomId: 'abc', recentRooms: [{ roomId: 'x' }] },
    };
    expect(selectCurrentRoomId(rootState)).toBe('abc');
    expect(selectRecentRooms(rootState)).toEqual([{ roomId: 'x' }]);
  });
});
