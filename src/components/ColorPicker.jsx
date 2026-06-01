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
  border: `2px solid ${active ? '#fff' : 'transparent'}`,
  background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5), transparent 50%), ${color}`,
  cursor: 'pointer',
  padding: 0,
  transition: 'transform 0.15s, border-color 0.2s, box-shadow 0.2s',
  boxShadow: active
    ? `0 0 0 3px ${theme.colors.bg0}, 0 0 16px ${color}, inset 0 1px 0 rgba(255,255,255,0.3)`
    : `inset 0 0 0 1px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.25)`,
  '&:hover': {
    transform: 'scale(1.12)',
    boxShadow: active
      ? `0 0 0 3px ${theme.colors.bg0}, 0 0 20px ${color}, inset 0 1px 0 rgba(255,255,255,0.3)`
      : `0 0 12px ${color}, inset 0 1px 0 rgba(255,255,255,0.3)`,
  },
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
