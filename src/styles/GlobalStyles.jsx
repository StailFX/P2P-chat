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
          color: ${theme.colors.text};
          font-family: ${theme.fonts.body};
          font-size: 14px;
          line-height: 1.45;
          -webkit-font-smoothing: antialiased;
          background-color: ${theme.colors.bg0};
          background-image:
            radial-gradient(
              ellipse 60% 50% at 20% 0%,
              rgba(34, 211, 238, 0.18),
              transparent 60%
            ),
            radial-gradient(
              ellipse 50% 60% at 100% 30%,
              rgba(167, 139, 250, 0.15),
              transparent 60%
            ),
            radial-gradient(
              ellipse 80% 50% at 50% 100%,
              rgba(110, 168, 254, 0.12),
              transparent 60%
            ),
            radial-gradient(
              ellipse 40% 30% at 0% 70%,
              rgba(52, 211, 153, 0.08),
              transparent 60%
            );
          background-attachment: fixed;
          background-repeat: no-repeat;
        }

        #root::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image: radial-gradient(
            rgba(255, 255, 255, 0.015) 1px,
            transparent 1px
          );
          background-size: 3px 3px;
          opacity: 0.6;
        }

        button,
        input,
        textarea {
          font-family: inherit;
        }

        a {
          color: ${theme.colors.cyan};
        }

        :focus {
          outline: none;
        }
        :focus-visible {
          outline: 2px solid ${theme.colors.cyan};
          outline-offset: 2px;
          border-radius: ${theme.radii.sm};
        }

        ::selection {
          background: ${theme.colors.cyanSoft};
          color: ${theme.colors.text};
        }

        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 8px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.16);
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
