// Безопасный размер чанка для WebRTC (16 КБ)
const CHUNK_SIZE = 16 * 1024; 

/**
 * ФУНКЦИЯ 1: НАРЕЗКА И ОТПРАВКА
 * Вызывается, когда мы хотим отправить файл.
 */
export const sendFileInChunks = async (file, fileId, onChunkReady, onProgress) => {
  let offset = 0; // Текущая позиция (откуда резать)

  // Сначала отправляем метаданные (информацию о файле), чтобы получатель знал, что ждет
  onChunkReady({
    type: 'file-start',
    fileId: fileId,
    name: file.name,
    size: file.size,
    fileType: file.type,
  });

  // Цикл: пока мы не дошли до конца файла
  while (offset < file.size) {
    // Отрезаем кусок файла
    const chunk = file.slice(offset, offset + CHUNK_SIZE);
    
    // Превращаем кусок в Base64 (текстовый формат), чтобы безопасно передать через JSON
    const base64Data = await convertBlobToBase64(chunk);

    // Отдаем кусок "наружу" (Севе), чтобы он закинул его в WebRTC
    onChunkReady({
      type: 'file-chunk',
      fileId: fileId,
      data: base64Data,
    });

    offset += CHUNK_SIZE; // Сдвигаем ползунок дальше

    // Считаем прогресс (от 0 до 100) и отдаем в Redux
    const progress = Math.min(Math.round((offset / file.size) * 100), 100);
    onProgress(progress);
  }

  // Говорим, что файл закончился
  onChunkReady({ type: 'file-end', fileId: fileId });
};

/**
 * ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ: Преобразование сырых данных в Base64 текст
 */
const convertBlobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]); // Берем только сами данные
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * КЛАСС 2: СБОРКА ВХОДЯЩИХ ФАЙЛОВ
 * Сохраняет куски от Севы, пока файл не соберется целиком.
 */
export class FileReceiver {
  constructor() {
    this.incomingFiles = {}; // Хранилище: { "id_файла": { meta: {...}, chunks: [] } }
  }

  // Сюда Сева будет передавать всё, что прилетело по WebRTC
  handleIncomingData(message, onProgress, onComplete) {
    const { type, fileId, data, name, size, fileType } = message;

    if (type === 'file-start') {
      // Готовим "папку" для нового файла
      this.incomingFiles[fileId] = {
        meta: { name, size, fileType },
        chunks: [],
        receivedSize: 0,
      };
    } 
    
    else if (type === 'file-chunk') {
      const fileData = this.incomingFiles[fileId];
      if (!fileData) return;

      // Декодируем Base64 обратно в бинарные данные
      const binaryString = atob(data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Сохраняем кусок
      fileData.chunks.push(bytes);
      fileData.receivedSize += bytes.length;

      // Считаем прогресс для Redux
      const progress = Math.min(Math.round((fileData.receivedSize / fileData.meta.size) * 100), 100);
      onProgress(fileId, progress);
    } 
    
    else if (type === 'file-end') {
      const fileData = this.incomingFiles[fileId];
      if (!fileData) return;

      // СКЛЕЙКА: берем все куски и делаем из них один полноценный Blob (файл)
      const blob = new Blob(fileData.chunks, { type: fileData.meta.fileType });
      
      // Создаем ссылку для скачивания (которую мы привяжем к кнопке "Скачать")
      const downloadUrl = URL.createObjectURL(blob);

      // Отдаем в Redux сигнал о завершении и ссылку на файл
      onComplete(fileId, downloadUrl);

      // Очищаем память
      delete this.incomingFiles[fileId];
    }
  }
}

// Создаем глобальный объект приемника (чтобы он жил в памяти постоянно)
export const receiverInstance = new FileReceiver();