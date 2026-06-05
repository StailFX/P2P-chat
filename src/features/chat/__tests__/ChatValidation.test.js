import { validateMessage } from '../chatValidation';

describe('validateMessage', () => {
  test('запрещает пустое сообщение', () => {
    const result = validateMessage('');

    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test('запрещает сообщение из пробелов', () => {
    const result = validateMessage('     ');

    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test('разрешает обычное сообщение', () => {
    const result = validateMessage('Привет');

    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  test('запрещает сообщение длиннее 2000 символов', () => {
    const longMessage = 'a'.repeat(2001);

    const result = validateMessage(longMessage);

    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });
});