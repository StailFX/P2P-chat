import { useId } from 'react';
import styled from '@emotion/styled';

const Wrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
});

const Label = styled.label(({ theme }) => ({
  fontSize: 12,
  color: theme.colors.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}));

const Control = styled.input(({ theme, hasError }) => ({
  background: theme.colors.bg2,
  border: `1px solid ${hasError ? theme.colors.danger : theme.colors.border}`,
  borderRadius: theme.radii.md,
  color: theme.colors.text,
  padding: '11px 14px',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.15s, background 0.15s',
  '&:hover': { borderColor: hasError ? theme.colors.danger : theme.colors.borderStrong },
  '&:focus': {
    borderColor: hasError ? theme.colors.danger : theme.colors.accent,
    background: theme.colors.bg1,
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
