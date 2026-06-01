import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AvatarPicker } from '../AvatarPicker';
import { AVATARS } from '../../constants/avatars';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

describe('AvatarPicker', () => {
  test('рендерит все аватары как radio в одной группе', () => {
    renderWithProviders(<AvatarPicker value="fox" onChange={() => {}} />);
    const group = screen.getByRole('radiogroup', { name: 'Аватар' });
    const radios = within(group).getAllByRole('radio');
    expect(radios).toHaveLength(AVATARS.length);
  });

  test('активный — отмечен aria-checked=true, остальные — false', () => {
    renderWithProviders(<AvatarPicker value="wolf" onChange={() => {}} />);
    const wolf = screen.getByRole('radio', { name: 'Волк' });
    const fox = screen.getByRole('radio', { name: 'Лиса' });
    expect(wolf).toHaveAttribute('aria-checked', 'true');
    expect(fox).toHaveAttribute('aria-checked', 'false');
  });

  test('клик — onChange с id', async () => {
    const onChange = jest.fn();
    renderWithProviders(<AvatarPicker value="fox" onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Ракета' }));
    expect(onChange).toHaveBeenCalledWith('rocket');
  });
});
