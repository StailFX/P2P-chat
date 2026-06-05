import styled from '@emotion/styled';

const sizes = {
  sm: { padding: '8px 14px', fontSize: '13px', minHeight: '34px' },
  md: { padding: '11px 18px', fontSize: '14px', minHeight: '42px' },
  lg: { padding: '14px 22px', fontSize: '15px', minHeight: '50px' },
};

const StyledButton = styled.button(
  ({ theme }) => ({
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    border: '1px solid transparent',
    borderRadius: theme.radii.md,
    cursor: 'pointer',
    fontWeight: 600,
    letterSpacing: '0.01em',
    transition:
      'background 0.2s, border-color 0.2s, color 0.2s, transform 0.05s, box-shadow 0.2s',
    userSelect: 'none',
    backdropFilter: theme.blurs.glassLight,
    WebkitBackdropFilter: theme.blurs.glassLight,
    '&:disabled': { opacity: 0.45, cursor: 'not-allowed' },
    '&:not(:disabled):active': { transform: 'translateY(1px)' },
  }),
  ({ size = 'md' }) => sizes[size],
  ({ fullWidth }) => (fullWidth ? { width: '100%' } : null),
  ({ theme, variant = 'primary' }) => {
    switch (variant) {
      case 'primary':
        return {
          background: `linear-gradient(180deg, ${theme.colors.cyan} 0%, ${theme.colors.accent} 55%, ${theme.colors.accentStrong} 100%)`,
          color: '#08111e',
          borderColor: 'rgba(255, 255, 255, 0.18)',
          boxShadow: `
            inset 0 1px 0 rgba(255, 255, 255, 0.4),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2),
            0 0 16px rgba(110, 168, 254, 0.2),
            0 10px 24px rgba(0, 0, 0, 0.4)
          `,
          '&:not(:disabled):hover': {
            boxShadow: `
              inset 0 1px 0 rgba(255, 255, 255, 0.5),
              inset 0 -1px 0 rgba(0, 0, 0, 0.2),
              0 0 22px rgba(110, 168, 254, 0.32),
              0 14px 28px rgba(0, 0, 0, 0.45)
            `,
          },
        };
      case 'secondary':
        return {
          background: theme.colors.glassBg,
          color: theme.colors.text,
          borderColor: theme.colors.glassBorder,
          boxShadow: `
            inset 0 1px 0 ${theme.colors.glassHighlight},
            0 4px 16px rgba(0, 0, 0, 0.3)
          `,
          '&:not(:disabled):hover': {
            background: theme.colors.glassBgStrong,
            borderColor: theme.colors.borderStrong,
            boxShadow: `
              inset 0 1px 0 ${theme.colors.glassHighlight},
              0 0 24px rgba(34, 211, 238, 0.18),
              0 4px 16px rgba(0, 0, 0, 0.4)
            `,
          },
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: theme.colors.textMuted,
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          '&:not(:disabled):hover': {
            background: theme.colors.glassBg,
            color: theme.colors.text,
          },
        };
      case 'danger':
        return {
          background: 'transparent',
          color: theme.colors.danger,
          borderColor: theme.colors.glassBorder,
          '&:not(:disabled):hover': { background: theme.colors.dangerSoft },
        };
      default:
        return null;
    }
  },
);

export function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled,
  onClick,
  fullWidth,
  size = 'md',
  ...rest
}) {
  return (
    <StyledButton
      type={type}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </StyledButton>
  );
}
