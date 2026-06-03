export const NICKNAME_COLORS = [
  { id: 'red', value: '#ff6b6b' },
  { id: 'orange', value: '#ffa94d' },
  { id: 'yellow', value: '#ffd43b' },
  { id: 'green', value: '#69db7c' },
  { id: 'teal', value: '#3bc9db' },
  { id: 'blue', value: '#74c0fc' },
  { id: 'indigo', value: '#9775fa' },
  { id: 'pink', value: '#f783ac' },
];

export const DEFAULT_NICKNAME_COLOR = 'teal';

export const getColorById = (id) =>
  NICKNAME_COLORS.find((c) => c.id === id) || NICKNAME_COLORS[0];
