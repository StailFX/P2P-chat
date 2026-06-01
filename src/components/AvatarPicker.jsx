import styled from '@emotion/styled';
import { AVATARS } from '../constants/avatars';

const Grid = styled.div(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(8, 1fr)',
  gap: 8,
  [`@media (max-width: ${theme.breakpoints.mobile})`]: {
    gridTemplateColumns: 'repeat(6, 1fr)',
  },
}));

const Item = styled.button(({ theme, active }) => ({
  background: active ? theme.colors.accentSoft : theme.colors.bg2,
  border: `1px solid ${active ? theme.colors.accent : theme.colors.border}`,
  borderRadius: theme.radii.md,
  aspectRatio: '1 / 1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: 0,
  transition: 'border-color 0.15s, background 0.15s, transform 0.05s',
  '&:hover': {
    borderColor: active ? theme.colors.accent : theme.colors.borderStrong,
    background: active ? theme.colors.accentSoft : theme.colors.bg3,
  },
  '&:active': { transform: 'scale(0.96)' },
}));

const Emoji = styled.span({ fontSize: 22, lineHeight: 1 });

export function AvatarPicker({ value, onChange }) {
  return (
    <Grid role="radiogroup" aria-label="Аватар">
      {AVATARS.map((a) => (
        <Item
          key={a.id}
          type="button"
          role="radio"
          active={value === a.id}
          onClick={() => onChange(a.id)}
          title={a.label}
          aria-label={a.label}
          aria-checked={value === a.id}
        >
          <Emoji role="img" aria-hidden="true">
            {a.emoji}
          </Emoji>
        </Item>
      ))}
    </Grid>
  );
}
