const CHUNK_SIZE = 16 * 1024; 

export const sendFileInChunks = async (file, fileId, onChunkReady, onProgress) => {
  let offset = 0;
  let lastProgress = 0; // Запоминаем последний отправленный процент

  onChunkReady({
    type: 'file-start',
    fileId: fileId,
    name: file.name,
    size: file.size,
    fileType: file.type,
  });

  while (offset < file.size) {
    const chunk = file.slice(offset, offset + CHUNK_SIZE);
    const base64Data = await convertBlobToBase64(chunk);

    onChunkReady({
      type: 'file-chunk',
      fileId: fileId,
      data: base64Data,
    });

    offset += CHUNK_SIZE;

    // Считаем текущий процент
    const currentProgress = Math.min(Math.round((offset / file.size) * 100), 100);
    
    // Отправляем в Redux ТОЛЬКО если процент вырос (убираем спам)
    if (currentProgress > lastProgress) {
      onProgress(currentProgress);
      lastProgress = currentProgress;
    }

    // Пауза 5мс для разгрузки браузера
    await new Promise(resolve => setTimeout(resolve, 5));
  }

  // Файл точно закончился, отправляем 100% и сигнал конца
  onProgress(100);
  onChunkReady({ type: 'file-end', fileId: fileId });
};

const convertBlobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export class FileReceiver {
  constructor() {
    this.incomingFiles = {};
  }

  handleIncomingData(message, onProgress, onComplete) {
    const { type, fileId, data, name, size, fileType } = message;

    if (type === 'file-start') {
      this.incomingFiles[fileId] = {
        meta: { name, size, fileType },
        chunks: [],
        receivedSize: 0,
        lastProgress: 0 // Добавили защиту от спама и для получателя
      };
    } 
    else if (type === 'file-chunk') {
      const fileData = this.incomingFiles[fileId];
      if (!fileData) return;

      const binaryString = atob(data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      fileData.chunks.push(bytes);
      fileData.receivedSize += bytes.length;

      const currentProgress = Math.min(Math.round((fileData.receivedSize / fileData.meta.size) * 100), 100);
      
      // Обновляем UI получателя только если процент изменился
      if (currentProgress > fileData.lastProgress) {
        onProgress(fileId, currentProgress);
        fileData.lastProgress = currentProgress;
      }
    } 
    else if (type === 'file-end') {
      const fileData = this.incomingFiles[fileId];
      if (!fileData) return;

      const blob = new Blob(fileData.chunks, { type: fileData.meta.fileType });
      const downloadUrl = URL.createObjectURL(blob);

      // Гарантируем 100% при сборке файла
      onProgress(fileId, 100);
      onComplete(fileId, downloadUrl);

      delete this.incomingFiles[fileId];
    }
  }
}

export const receiverInstance = new FileReceiver();