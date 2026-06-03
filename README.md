# P2P Chat

## Стек

- React 18, React Router v6
- Redux Toolkit + react-redux
- Emotion (`@emotion/react` + `@emotion/styled`)
- Webpack 5 + Babel
- Jest + React Testing Library
- Docker + nginx для прод-раздачи

## Запуск

```bash
npm install
npm start              # http://localhost:3000
npm run build          # сборка в ./dist
npm test               # юнит-тесты
npm run test:watch     # тесты в watch-режиме
npm run test:coverage  # покрытие
```

## Docker

```bash
docker build -t p2p-chat .
docker run --rm -p 8080:80 p2p-chat
# http://localhost:8080
```

Multi-stage сборка: node собирает бандл, nginx раздаёт статику со
SPA-fallback на `index.html` (нужен для роутера на прямом заходе по
адресу вида `/room/:id/chat`).

## Структура

```
src/
  app/store.js                  configureStore
  features/
    profile/profileSlice.js     ник, аватар, цвет
    room/roomSlice.js           roomId, recentRooms, статусы
  storage/localStorage.js       обёртка с префиксом p2pchat:
  screens/
    Lobby/Lobby.jsx             экран лобби
    RoomLayout.jsx              табы Чат / Файлы
    Chat/Chat.jsx               экран чата
    Files/Files.jsx             экран файлов
  components/                   Button, Input, AvatarPicker, ColorPicker
  constants/                    avatars, colors, screens
  styles/                       theme (токены) + GlobalStyles
  test-utils/                   renderWithProviders для тестов
public/index.html
webpack.config.js
nginx.conf
Dockerfile
```

## Маршруты

- `/` — лобби (профиль + создание/вход в комнату)
- `/room/:roomId/chat` — чат
- `/room/:roomId/files` — файлы

## Тесты

`npm test` запускает Jest. Тесты лежат рядом с кодом — в папках
`__tests__/`. Для компонентов есть общий рендер с Redux, темой и роутером:
`src/test-utils/renderWithProviders.jsx`.

## Ветки

- `main` — релизная
- `dev` — интеграционная
- `feature/...` — фичи, мерджатся в `dev`
