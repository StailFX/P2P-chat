import styled from '@emotion/styled';
import { NICKNAME_COLORS } from '../constants/colors';

const Group = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
});

const Dot = styled.button(({ theme, active, color }) => ({
  width: 28,
  height: 28,
  borderRadius: '50%',
  border: `2px solid ${active ? theme.colors.text : 'transparent'}`,
  background: color,
  cursor: 'pointer',
  padding: 0,
  transition: 'transform 0.05s, border-color 0.15s, box-shadow 0.15s',
  boxShadow: active
    ? `0 0 0 3px ${theme.colors.bg1}, 0 0 0 4px ${theme.colors.accent}`
    : 'inset 0 0 0 1px rgba(0, 0, 0, 0.3)',
  '&:hover': { transform: 'scale(1.08)' },
}));

export function ColorPicker({ value, onChange }) {
  return (
    <Group role="radiogroup" aria-label="Цвет ника">
      {NICKNAME_COLORS.map((c) => (
        <Dot
          key={c.id}
          type="button"
          role="radio"
          color={c.value}
          active={value === c.id}
          onClick={() => onChange(c.id)}
          aria-label={`Цвет ${c.id}`}
          aria-checked={value === c.id}
        />
      ))}
    </Group>
  );
}
