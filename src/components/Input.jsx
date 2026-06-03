import { useId } from 'react';
import styled from '@emotion/styled';

const sizeMap = {
  md: { padding: '11px 14px', fontSize: 14, minHeight: 42 },
  lg: { padding: '14px 16px', fontSize: 15, minHeight: 50 },
};

const Wrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  width: '100%',
});

const Label = styled.label(({ theme }) => ({
  fontSize: 11,
  color: theme.colors.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: 600,
}));

const Control = styled.input(({ theme, hasError, size = 'md' }) => ({
  ...sizeMap[size],
  background: theme.colors.glassBg,
  border: `1px solid ${hasError ? theme.colors.danger : theme.colors.glassBorder}`,
  borderRadius: theme.radii.md,
  color: theme.colors.text,
  outline: 'none',
  backdropFilter: theme.blurs.glassLight,
  WebkitBackdropFilter: theme.blurs.glassLight,
  transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
  boxShadow: `inset 0 1px 0 ${theme.colors.glassHighlight}`,
  '&::placeholder': { color: theme.colors.textFaint },
  '&:hover': {
    borderColor: hasError ? theme.colors.danger : theme.colors.borderStrong,
  },
  '&:focus': {
    borderColor: hasError ? theme.colors.danger : theme.colors.cyan,
    background: theme.colors.glassBgStrong,
    boxShadow: `
      inset 0 1px 0 ${theme.colors.glassHighlight},
      0 0 0 3px ${hasError ? theme.colors.dangerSoft : theme.colors.cyanSoft}
    `,
  },
}));

const Hint = styled.span(({ theme, isError }) => ({
  fontSize: 12,
  color: isError ? theme.colors.danger : theme.colors.textFaint,
}));

export function Input({
  value,
  onChange,
  placeholder,
  label,
  hint,
  error,
  maxLength,
  autoFocus,
  id,
  type = 'text',
  size = 'md',
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const hintId = `${inputId}-hint`;

  return (
    <Wrapper>
      {label ? <Label htmlFor={inputId}>{label}</Label> : null}
      <Control
        id={inputId}
        type={type}
        size={size}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        autoFocus={autoFocus}
        autoComplete="off"
        spellCheck={false}
        hasError={!!error}
        aria-invalid={!!error}
        aria-describedby={error || hint ? hintId : undefined}
      />
      {error ? (
        <Hint id={hintId} isError role="alert">
          {error}
        </Hint>
      ) : hint ? (
        <Hint id={hintId}>{hint}</Hint>
      ) : null}
    </Wrapper>
  );
}
