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
  position: 'relative',
  background: active ? theme.colors.cyanSoft : theme.colors.glassBg,
  border: `1px solid ${active ? theme.colors.cyan : theme.colors.glassBorder}`,
  borderRadius: theme.radii.md,
  aspectRatio: '1 / 1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: 0,
  backdropFilter: theme.blurs.glassLight,
  WebkitBackdropFilter: theme.blurs.glassLight,
  transition:
    'border-color 0.2s, background 0.2s, transform 0.05s, box-shadow 0.2s',
  boxShadow: active
    ? `inset 0 1px 0 ${theme.colors.glassHighlight}, 0 0 20px ${theme.colors.cyanSoft}`
    : `inset 0 1px 0 ${theme.colors.glassHighlight}`,
  '&:hover': {
    borderColor: active ? theme.colors.cyan : theme.colors.borderStrong,
    background: active ? theme.colors.cyanSoft : theme.colors.bg2,
  },
  '&:active': { transform: 'scale(0.96)' },
}));

const Emoji = styled.span({
  fontSize: 22,
  lineHeight: 1,
  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
});

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
