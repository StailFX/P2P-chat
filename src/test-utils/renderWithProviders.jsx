import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@emotion/react';
import { MemoryRouter } from 'react-router-dom';
import profileReducer from '../features/profile/profileSlice';
import roomReducer from '../features/room/roomSlice';
import { theme } from '../styles/theme';

export const makeStore = (preloadedState) =>
  configureStore({
    reducer: {
      profile: profileReducer,
      room: roomReducer,
    },
    preloadedState,
  });

export const renderWithProviders = (
  ui,
  {
    preloadedState,
    store = makeStore(preloadedState),
    route = '/',
    routerEntries,
  } = {},
) => {
  const utils = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={routerEntries || [route]}>
          {ui}
        </MemoryRouter>
      </ThemeProvider>
    </Provider>,
  );
  return { store, ...utils };
};
