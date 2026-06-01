import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorPicker } from '../ColorPicker';
import { NICKNAME_COLORS } from '../../constants/colors';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

describe('ColorPicker', () => {
  test('рендерит все цвета как radio', () => {
    renderWithProviders(<ColorPicker value="teal" onChange={() => {}} />);
    const group = screen.getByRole('radiogroup', { name: 'Цвет ника' });
    expect(within(group).getAllByRole('radio')).toHaveLength(
      NICKNAME_COLORS.length,
    );
  });

  test('клик — onChange с id', async () => {
    const onChange = jest.fn();
    renderWithProviders(<ColorPicker value="teal" onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Цвет pink' }));
    expect(onChange).toHaveBeenCalledWith('pink');
  });
});
