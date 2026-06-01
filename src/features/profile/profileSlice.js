import { createSlice } from '@reduxjs/toolkit';
import {
  loadProfile,
  saveProfile,
  removeProfile,
} from '../../storage/localStorage';
import { DEFAULT_AVATAR_ID } from '../../constants/avatars';
import { DEFAULT_NICKNAME_COLOR } from '../../constants/colors';

const NICKNAME_MIN = 2;
const NICKNAME_MAX = 20;
const NICKNAME_RE = /^[a-zA-Zа-яА-ЯёЁ0-9_\- ]+$/;

const initialState = {
  nickname: '',
  avatarId: DEFAULT_AVATAR_ID,
  nicknameColor: DEFAULT_NICKNAME_COLOR,
  isValid: false,
  error: null,
};

const validate = ({ nickname, avatarId, nicknameColor }) => {
  if (!nickname || nickname.trim().length < NICKNAME_MIN) {
    return { isValid: false, error: `Ник должен быть от ${NICKNAME_MIN} символов` };
  }
  if (nickname.length > NICKNAME_MAX) {
    return { isValid: false, error: `Ник до ${NICKNAME_MAX} символов` };
  }
  if (!NICKNAME_RE.test(nickname)) {
    return { isValid: false, error: 'Допустимы буквы, цифры, пробел, _ и -' };
  }
  if (!avatarId) return { isValid: false, error: 'Выбери аватар' };
  if (!nicknameColor) return { isValid: false, error: 'Выбери цвет ника' };
  return { isValid: true, error: null };
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setNickname(state, action) {
      state.nickname = action.payload;
      const v = validate(state);
      state.isValid = v.isValid;
      state.error = v.error;
    },
    setAvatar(state, action) {
      state.avatarId = action.payload;
      const v = validate(state);
      state.isValid = v.isValid;
      state.error = v.error;
    },
    setNicknameColor(state, action) {
      state.nicknameColor = action.payload;
      const v = validate(state);
      state.isValid = v.isValid;
      state.error = v.error;
    },
    loadProfileFromStorage(state) {
      const stored = loadProfile();
      if (stored) {
        state.nickname = stored.nickname || '';
        state.avatarId = stored.avatarId || DEFAULT_AVATAR_ID;
        state.nicknameColor = stored.nicknameColor || DEFAULT_NICKNAME_COLOR;
        const v = validate(state);
        state.isValid = v.isValid;
        state.error = v.error;
      }
    },
    saveProfileToStorage(state) {
      const v = validate(state);
      if (!v.isValid) {
        state.error = v.error;
        return;
      }
      saveProfile({
        nickname: state.nickname,
        avatarId: state.avatarId,
        nicknameColor: state.nicknameColor,
      });
    },
    validateProfile(state) {
      const v = validate(state);
      state.isValid = v.isValid;
      state.error = v.error;
    },
    resetProfile(state) {
      removeProfile();
      state.nickname = '';
      state.avatarId = DEFAULT_AVATAR_ID;
      state.nicknameColor = DEFAULT_NICKNAME_COLOR;
      state.isValid = false;
      state.error = null;
    },
  },
});

export const {
  setNickname,
  setAvatar,
  setNicknameColor,
  loadProfileFromStorage,
  saveProfileToStorage,
  validateProfile,
  resetProfile,
} = profileSlice.actions;

export const selectProfile = (state) => state.profile;
export const selectIsProfileValid = (state) => state.profile.isValid;

export default profileSlice.reducer;
