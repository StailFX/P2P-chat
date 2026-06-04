import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// Обрати внимание, тут изменился путь до файла (две точки)
import { setDragging, addOutgoingFile, updateFileProgress, updateFileStatus } from '../../features/filesSlice';
import './Files.css'; 

export const Files = () => {
  const dispatch = useDispatch();
  const isDragging = useSelector((state) => state.files.isDragging);
  const filesList = useSelector((state) => state.files.list);

  // ФЕЙКОВАЯ ЗАГРУЗКА
  const simulateUpload = (fileId) => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      dispatch(updateFileProgress({ id: fileId, progress: currentProgress }));
      if (currentProgress >= 100) {
        clearInterval(interval);
        dispatch(updateFileStatus({ id: fileId, status: 'completed' }));
      }
    }, 500);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!isDragging) dispatch(setDragging(true));
  }, [dispatch, isDragging]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    dispatch(setDragging(false));
  }, [dispatch]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    dispatch(setDragging(false));

    const files = Array.from(e.dataTransfer.files);
    
    files.forEach((file) => {
      const fileId = Date.now() + '-' + file.name;
      dispatch(addOutgoingFile({
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
      }));
      simulateUpload(fileId);
    });
  }, [dispatch]);

  return (
    <div className="files-screen">
      <h2>Обмен файлами</h2>
      
      <div 
        className={`drop-zone ${isDragging ? 'active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p>{isDragging ? "Бросай сюда!" : "Перетащи файлы или выбери кнопкой"}</p>
        <input 
            type="file" multiple id="file-input" style={{ display: 'none' }}
            onChange={(e) => handleDrop({ ...e, dataTransfer: e.target, preventDefault: () => {} })}
        />
        <label htmlFor="file-input" className="upload-btn">Выбрать файлы</label>
      </div>

      <div className="files-list">
        {filesList.map((file) => (
          <div key={file.id} className="file-item">
             <div className="file-info">
               <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
               <span>{file.status === 'completed' ? '✅' : '⏳'}</span>
             </div>
             <div className="progress-bar-container">
               <div className="progress-bar" style={{ width: `${file.progress}%` }}></div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};