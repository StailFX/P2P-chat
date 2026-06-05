import styled from '@emotion/styled';
import { Button } from '../../../components/Button';

const Form = styled.form({
  flex: '0 0 auto',
  display: 'flex',
  gap: 10,
  alignItems: 'flex-start',
});

const InputWrap = styled.div({
  flex: 1,
});

const Label = styled.label({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
});

const Input = styled.input(({ theme }) => ({
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  borderRadius: theme.radii.md,
  border: `1px solid ${theme.colors.glassBorder}`,
  background: 'rgba(15, 23, 42, 0.55)',
  color: theme.colors.text,
  outline: 'none',
  fontSize: 14,

  '&::placeholder': {
    color: theme.colors.textMuted,
  },

  '&:focus': {
    borderColor: theme.colors.cyan,
  },

  '&:disabled': {
    cursor: 'not-allowed',
    opacity: 0.6,
  },
}));

const ErrorText = styled.p(({ theme }) => ({
  margin: '6px 0 0',
  color: theme.colors.red || '#fb7185',
  fontSize: 12,
}));

const DisabledHint = styled.p(({ theme }) => ({
  margin: '6px 0 0',
  color: theme.colors.textMuted,
  fontSize: 12,
}));

export function ChatMessageInput({
  inputRef,
  value,
  error,
  disabled,
  isSendDisabled,
  onChange,
  onSubmit,
}) {
  return (
    <Form
      aria-label="Форма отправки сообщения"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <InputWrap>
        <Label htmlFor="message-input">Сообщение</Label>

        <Input
          ref={inputRef}
          id="message-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Введите сообщение..."
          maxLength={2000}
          disabled={disabled}
        />

        {error && <ErrorText role="alert">{error}</ErrorText>}

        {disabled && (
          <DisabledHint>
            Сообщения можно отправлять после подключения второго участника
          </DisabledHint>
        )}
      </InputWrap>

      <Button type="submit" disabled={isSendDisabled}>
        Отправить
      </Button>
    </Form>
  );
}