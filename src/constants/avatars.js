export const AVATARS = [
  { id: 'fox', emoji: '🦊', label: 'Лиса' },
  { id: 'wolf', emoji: '🐺', label: 'Волк' },
  { id: 'bear', emoji: '🐻', label: 'Медведь' },
  { id: 'panda', emoji: '🐼', label: 'Панда' },
  { id: 'cat', emoji: '🐱', label: 'Кот' },
  { id: 'dog', emoji: '🐶', label: 'Пёс' },
  { id: 'tiger', emoji: '🐯', label: 'Тигр' },
  { id: 'lion', emoji: '🦁', label: 'Лев' },
  { id: 'frog', emoji: '🐸', label: 'Лягуш' },
  { id: 'monkey', emoji: '🐵', label: 'Обезьян' },
  { id: 'penguin', emoji: '🐧', label: 'Пингвин' },
  { id: 'owl', emoji: '🦉', label: 'Сова' },
  { id: 'unicorn', emoji: '🦄', label: 'Единорог' },
  { id: 'dragon', emoji: '🐉', label: 'Дракон' },
  { id: 'rocket', emoji: '🚀', label: 'Ракета' },
  { id: 'diamond', emoji: '💎', label: 'Алмаз' },
];

export const DEFAULT_AVATAR_ID = 'fox';

export const getAvatarById = (id) =>
  AVATARS.find((a) => a.id === id) || AVATARS[0];
