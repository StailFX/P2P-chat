import { Global, css, useTheme } from '@emotion/react';

export function GlobalStyles() {
  const theme = useTheme();
  return (
    <Global
      styles={css`
        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          height: 100%;
          margin: 0;
          padding: 0;
        }

        body {
          background: ${theme.colors.bg0};
          color: ${theme.colors.text};
          font-family: ${theme.fonts.body};
          font-size: 14px;
          line-height: 1.45;
          -webkit-font-smoothing: antialiased;
        }

        button,
        input,
        textarea {
          font-family: inherit;
        }

        a {
          color: ${theme.colors.accent};
        }

        :focus {
          outline: none;
        }
        :focus-visible {
          outline: 2px solid ${theme.colors.accent};
          outline-offset: 2px;
          border-radius: ${theme.radii.sm};
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}
    />
  );
}
