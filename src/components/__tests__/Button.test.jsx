import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

describe('Button', () => {
  test('рендерит текст и реагирует на клик', async () => {
    const onClick = jest.fn();
    renderWithProviders(<Button onClick={onClick}>Жми</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Жми' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('disabled блокирует клик', async () => {
    const onClick = jest.fn();
    renderWithProviders(
      <Button disabled onClick={onClick}>
        Нет
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Нет' });
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  test('type submit пробрасывается', () => {
    renderWithProviders(<Button type="submit">Send</Button>);
    expect(screen.getByRole('button', { name: 'Send' })).toHaveAttribute(
      'type',
      'submit',
    );
  });
});
