import reducer, {
  addOutgoingFile,
  addIncomingFile,
  updateFileProgress,
  updateFileStatus,
  setDragging,
  clearFiles,
  setFileError,
} from '../filesSlice';

const initial = () => reducer(undefined, { type: '@@INIT' });

describe('initial state', () => {
  test('пустой список, не drag, без ошибки', () => {
    const s = initial();
    expect(s.list).toEqual([]);
    expect(s.isDragging).toBe(false);
    expect(s.error).toBeNull();
  });
});

describe('addOutgoingFile / addIncomingFile', () => {
  test('addOutgoingFile добавляет с direction=outgoing, progress=0, status=pending', () => {
    const s = reducer(
      initial(),
      addOutgoingFile({ id: '1', name: 'a.txt', size: 100, type: 'text/plain' }),
    );
    expect(s.list).toHaveLength(1);
    expect(s.list[0]).toMatchObject({
      id: '1',
      name: 'a.txt',
      size: 100,
      direction: 'outgoing',
      progress: 0,
      status: 'pending',
    });
  });

  test('addIncomingFile добавляет с direction=incoming, status=receiving', () => {
    const s = reducer(
      initial(),
      addIncomingFile({ id: '2', name: 'b.png', size: 200, type: 'image/png' }),
    );
    expect(s.list[0]).toMatchObject({
      id: '2',
      direction: 'incoming',
      progress: 0,
      status: 'receiving',
    });
  });

  test('несколько файлов копятся в порядке добавления', () => {
    let s = reducer(initial(), addOutgoingFile({ id: 'a', name: 'a', size: 1 }));
    s = reducer(s, addIncomingFile({ id: 'b', name: 'b', size: 2 }));
    s = reducer(s, addOutgoingFile({ id: 'c', name: 'c', size: 3 }));
    expect(s.list.map((f) => f.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('updateFileProgress', () => {
  test('обновляет progress существующего файла', () => {
    let s = reducer(initial(), addOutgoingFile({ id: '1', name: 'x', size: 100 }));
    s = reducer(s, updateFileProgress({ id: '1', progress: 42 }));
    expect(s.list[0].progress).toBe(42);
  });

  test('не падает на несуществующем id', () => {
    const s = reducer(initial(), updateFileProgress({ id: 'ghost', progress: 50 }));
    expect(s.list).toEqual([]);
  });

  test('не трогает соседние файлы', () => {
    let s = reducer(initial(), addOutgoingFile({ id: 'a', name: 'a', size: 1 }));
    s = reducer(s, addOutgoingFile({ id: 'b', name: 'b', size: 1 }));
    s = reducer(s, updateFileProgress({ id: 'b', progress: 75 }));
    expect(s.list[0].progress).toBe(0);
    expect(s.list[1].progress).toBe(75);
  });
});

describe('updateFileStatus', () => {
  test('обновляет статус', () => {
    let s = reducer(initial(), addOutgoingFile({ id: '1', name: 'x', size: 1 }));
    s = reducer(s, updateFileStatus({ id: '1', status: 'completed' }));
    expect(s.list[0].status).toBe('completed');
  });

  test('сохраняет blobUrl, если передан', () => {
    let s = reducer(initial(), addIncomingFile({ id: '1', name: 'x', size: 1 }));
    s = reducer(
      s,
      updateFileStatus({ id: '1', status: 'completed', blobUrl: 'blob:1' }),
    );
    expect(s.list[0].blobUrl).toBe('blob:1');
  });

  test('без blobUrl поле не появляется', () => {
    let s = reducer(initial(), addOutgoingFile({ id: '1', name: 'x', size: 1 }));
    s = reducer(s, updateFileStatus({ id: '1', status: 'completed' }));
    expect(s.list[0].blobUrl).toBeUndefined();
  });
});

describe('setDragging', () => {
  test('переключает isDragging', () => {
    let s = reducer(initial(), setDragging(true));
    expect(s.isDragging).toBe(true);
    s = reducer(s, setDragging(false));
    expect(s.isDragging).toBe(false);
  });
});

describe('clearFiles', () => {
  test('очищает список', () => {
    let s = reducer(initial(), addOutgoingFile({ id: 'a', name: 'a', size: 1 }));
    s = reducer(s, addIncomingFile({ id: 'b', name: 'b', size: 1 }));
    s = reducer(s, clearFiles());
    expect(s.list).toEqual([]);
  });
});

describe('setFileError', () => {
  test('записывает ошибку', () => {
    const s = reducer(initial(), setFileError('boom'));
    expect(s.error).toBe('boom');
  });
});
