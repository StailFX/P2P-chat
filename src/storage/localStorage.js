const NAMESPACE = 'p2pchat:';

const PROFILE_KEY = `${NAMESPACE}profile`;
const RECENT_ROOMS_KEY = `${NAMESPACE}recentRooms`;

export const RECENT_ROOMS_LIMIT = 5;

const safeRead = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
};

const safeWrite = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded or private mode */
  }
};

const safeRemove = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    /* no-op */
  }
};

export const loadProfile = () => safeRead(PROFILE_KEY);
export const saveProfile = (profile) => safeWrite(PROFILE_KEY, profile);
export const removeProfile = () => safeRemove(PROFILE_KEY);

export const loadRecentRooms = () => safeRead(RECENT_ROOMS_KEY) || [];
export const saveRecentRooms = (rooms) => safeWrite(RECENT_ROOMS_KEY, rooms);
