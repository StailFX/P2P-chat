import { sendFileInChunks, FileReceiver } from '../fileTransfer';

// jsdom умеет в File/Blob/FileReader/atob, но crypto тут не нужен.

describe('sendFileInChunks', () => {
  test('эмитит file-start с метаданными, chunks и file-end', async () => {
    const file = new File(['hello world'], 'greeting.txt', { type: 'text/plain' });
    const messages = [];
    const progresses = [];

    await sendFileInChunks(
      file,
      'fid-1',
      (m) => messages.push(m),
      (p) => progresses.push(p),
    );

    expect(messages[0]).toMatchObject({
      type: 'file-start',
      fileId: 'fid-1',
      name: 'greeting.txt',
      size: file.size,
      fileType: 'text/plain',
    });
    expect(messages[messages.length - 1]).toEqual({
      type: 'file-end',
      fileId: 'fid-1',
    });
    const chunks = messages.filter((m) => m.type === 'file-chunk');
    expect(chunks.length).toBeGreaterThan(0);
    for (const c of chunks) {
      expect(c).toMatchObject({ type: 'file-chunk', fileId: 'fid-1' });
      expect(typeof c.data).toBe('string');
    }
  });

  test('progress в конце равен 100', async () => {
    const file = new File(['x'.repeat(50000)], 'big.bin');
    const progresses = [];
    await sendFileInChunks(file, 'fid', () => {}, (p) => progresses.push(p));
    expect(progresses[progresses.length - 1]).toBe(100);
  });
});

describe('FileReceiver', () => {
  test('собирает чанки в Blob и вызывает onComplete с URL', async () => {
    const text = 'hello receiver';
    const file = new File([text], 'r.txt', { type: 'text/plain' });

    const sentMessages = [];
    await sendFileInChunks(file, 'rx-1', (m) => sentMessages.push(m), () => {});

    const receiver = new FileReceiver();
    const progressUpdates = [];
    let completedUrl = null;

    for (const msg of sentMessages) {
      receiver.handleIncomingData(
        msg,
        (id, p) => progressUpdates.push({ id, p }),
        (id, url) => {
          completedUrl = { id, url };
        },
      );
    }

    expect(completedUrl).not.toBeNull();
    expect(completedUrl.id).toBe('rx-1');
    expect(typeof completedUrl.url).toBe('string');
    // последний прогресс — 100
    expect(progressUpdates[progressUpdates.length - 1].p).toBe(100);
  });

  test('игнорирует чанки для незнакомого fileId', () => {
    const receiver = new FileReceiver();
    const onProgress = jest.fn();
    const onComplete = jest.fn();
    receiver.handleIncomingData(
      { type: 'file-chunk', fileId: 'unknown', data: 'aGVsbG8=' },
      onProgress,
      onComplete,
    );
    receiver.handleIncomingData(
      { type: 'file-end', fileId: 'unknown' },
      onProgress,
      onComplete,
    );
    expect(onProgress).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
