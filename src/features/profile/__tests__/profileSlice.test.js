import reducer, {
  setNickname,
  setAvatar,
  setNicknameColor,
  saveProfileToStorage,
  loadProfileFromStorage,
  validateProfile,
  resetProfile,
  selectProfile,
  selectIsProfileValid,
} from '../profileSlice';
import { saveProfile } from '../../../storage/localStorage';
import { DEFAULT_AVATAR_ID } from '../../../constants/avatars';
import { DEFAULT_NICKNAME_COLOR } from '../../../constants/colors';

beforeEach(() => {
  localStorage.clear();
});

const initial = () => reducer(undefined, { type: '@@INIT' });

describe('initial state', () => {
  test('пустой ник, дефолтный аватар и цвет, isValid=false', () => {
    const s = initial();
    expect(s.nickname).toBe('');
    expect(s.avatarId).toBe(DEFAULT_AVATAR_ID);
    expect(s.nicknameColor).toBe(DEFAULT_NICKNAME_COLOR);
    expect(s.isValid).toBe(false);
  });
});

describe('setNickname + валидация', () => {
  test('валидный ник: isValid=true, error=null', () => {
    const s = reducer(initial(), setNickname('Никита'));
    expect(s.nickname).toBe('Никита');
    expect(s.isValid).toBe(true);
    expect(s.error).toBeNull();
  });

  test('пустой ник: ошибка', () => {
    const s = reducer(initial(), setNickname(''));
    expect(s.isValid).toBe(false);
    expect(s.error).toMatch(/от 2/);
  });

  test('ник длиннее 20: ошибка', () => {
    const s = reducer(initial(), setNickname('a'.repeat(21)));
    expect(s.isValid).toBe(false);
    expect(s.error).toMatch(/до 20/);
  });

  test('запрещённые символы: ошибка', () => {
    const s = reducer(initial(), setNickname('hello@world'));
    expect(s.isValid).toBe(false);
    expect(s.error).toMatch(/буквы/i);
  });

  test('пробел, _ и - разрешены', () => {
    const s = reducer(initial(), setNickname('John_Doe-2'));
    expect(s.isValid).toBe(true);
  });
});

describe('setAvatar и setNicknameColor', () => {
  test('меняют поля и держат isValid в согласованном состоянии', () => {
    let s = reducer(initial(), setNickname('Никита'));
    s = reducer(s, setAvatar('rocket'));
    expect(s.avatarId).toBe('rocket');
    expect(s.isValid).toBe(true);
    s = reducer(s, setNicknameColor('pink'));
    expect(s.nicknameColor).toBe('pink');
    expect(s.isValid).toBe(true);
  });
});

describe('saveProfileToStorage', () => {
  test('пишет в localStorage только при валидном профиле', () => {
    const validState = reducer(initial(), setNickname('Никита'));
    reducer(validState, saveProfileToStorage());
    expect(localStorage.getItem('p2pchat:profile')).toContain('Никита');
  });

  test('не пишет, если профиль не валиден', () => {
    reducer(initial(), saveProfileToStorage());
    expect(localStorage.getItem('p2pchat:profile')).toBeNull();
  });
});

describe('loadProfileFromStorage', () => {
  test('подтягивает сохранённый профиль и пересчитывает валидацию', () => {
    saveProfile({ nickname: 'Сева', avatarId: 'wolf', nicknameColor: 'red' });
    const s = reducer(initial(), loadProfileFromStorage());
    expect(s.nickname).toBe('Сева');
    expect(s.avatarId).toBe('wolf');
    expect(s.nicknameColor).toBe('red');
    expect(s.isValid).toBe(true);
  });

  test('пустое хранилище — state не меняется', () => {
    const s = reducer(initial(), loadProfileFromStorage());
    expect(s.nickname).toBe('');
    expect(s.isValid).toBe(false);
  });
});

describe('validateProfile и resetProfile', () => {
  test('validateProfile пересчитывает isValid', () => {
    let s = { ...initial(), nickname: 'Никита' };
    s = reducer(s, validateProfile());
    expect(s.isValid).toBe(true);
  });

  test('resetProfile зачищает state и localStorage', () => {
    saveProfile({ nickname: 'X', avatarId: 'fox', nicknameColor: 'teal' });
    let s = reducer(initial(), setNickname('Никита'));
    s = reducer(s, resetProfile());
    expect(s.nickname).toBe('');
    expect(s.isValid).toBe(false);
    expect(localStorage.getItem('p2pchat:profile')).toBeNull();
  });
});

describe('селекторы', () => {
  test('selectProfile возвращает срез profile', () => {
    const rootState = { profile: initial() };
    expect(selectProfile(rootState)).toEqual(rootState.profile);
  });

  test('selectIsProfileValid', () => {
    const rootState = { profile: { ...initial(), isValid: true } };
    expect(selectIsProfileValid(rootState)).toBe(true);
  });
});
