import '@testing-library/jest-dom';

// jsdom отдаёт crypto без randomUUID — заменяем на node webcrypto.
// eslint-disable-next-line global-require
const { webcrypto } = require('crypto');
if (typeof globalThis.crypto?.randomUUID !== 'function') {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    configurable: true,
    writable: true,
  });
}

// jsdom не реализует URL.createObjectURL — нужна для FileReceiver в тестах.
if (typeof URL.createObjectURL !== 'function') {
  let counter = 0;
  URL.createObjectURL = () => `blob:mock-${++counter}`;
}
