import styled from '@emotion/styled';

const sizes = {
  sm: { padding: '6px 12px', fontSize: '13px' },
  md: { padding: '10px 18px', fontSize: '14px' },
  lg: { padding: '14px 22px', fontSize: '15px' },
};

const StyledButton = styled.button(
  ({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    border: '1px solid transparent',
    borderRadius: theme.radii.md,
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'background 0.15s, border-color 0.15s, color 0.15s, transform 0.05s',
    userSelect: 'none',
    '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
    '&:not(:disabled):active': { transform: 'translateY(1px)' },
  }),
  ({ size = 'md' }) => sizes[size],
  ({ fullWidth }) => (fullWidth ? { width: '100%' } : null),
  ({ theme, variant = 'primary' }) => {
    switch (variant) {
      case 'primary':
        return {
          background: theme.colors.accent,
          color: theme.colors.bg0,
          '&:not(:disabled):hover': { background: theme.colors.accentStrong },
        };
      case 'secondary':
        return {
          background: theme.colors.bg2,
          color: theme.colors.text,
          borderColor: theme.colors.border,
          '&:not(:disabled):hover': {
            background: theme.colors.bg3,
            borderColor: theme.colors.borderStrong,
          },
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: theme.colors.textMuted,
          '&:not(:disabled):hover': {
            background: theme.colors.bg2,
            color: theme.colors.text,
          },
        };
      case 'danger':
        return {
          background: 'transparent',
          color: theme.colors.danger,
          borderColor: theme.colors.border,
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
