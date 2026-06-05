import {
  loadProfile,
  saveProfile,
  removeProfile,
  loadRecentRooms,
  saveRecentRooms,
  RECENT_ROOMS_LIMIT,
} from '../localStorage';

beforeEach(() => {
  localStorage.clear();
});

describe('profile storage', () => {
  test('сохраняет и читает профиль', () => {
    const profile = { nickname: 'Никита', avatarId: 'fox', nicknameColor: 'teal' };
    saveProfile(profile);
    expect(loadProfile()).toEqual(profile);
  });

  test('возвращает null, если ничего не сохранено', () => {
    expect(loadProfile()).toBeNull();
  });

  test('removeProfile очищает ключ', () => {
    saveProfile({ nickname: 'X', avatarId: 'fox', nicknameColor: 'teal' });
    removeProfile();
    expect(loadProfile()).toBeNull();
  });

  test('использует namespace-префикс p2pchat:', () => {
    saveProfile({ nickname: 'X' });
    const keys = Object.keys(localStorage);
    expect(keys.some((k) => k.startsWith('p2pchat:'))).toBe(true);
  });

  test('повреждённый JSON возвращает null', () => {
    localStorage.setItem('p2pchat:profile', '{not json');
    expect(loadProfile()).toBeNull();
  });
});

describe('recent rooms storage', () => {
  test('по умолчанию — пустой массив', () => {
    expect(loadRecentRooms()).toEqual([]);
  });

  test('сохраняет и читает список', () => {
    const rooms = [
      { roomId: 'a1b2c3', lastVisitedAt: 1700000000000 },
      { roomId: 'd4e5f6', lastVisitedAt: 1700000001000 },
    ];
    saveRecentRooms(rooms);
    expect(loadRecentRooms()).toEqual(rooms);
  });

  test('RECENT_ROOMS_LIMIT > 0', () => {
    expect(RECENT_ROOMS_LIMIT).toBeGreaterThan(0);
  });
});
