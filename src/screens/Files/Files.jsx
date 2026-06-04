import React, { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { Button } from '../../components/Button';
import { setDragging, addOutgoingFile, addIncomingFile, updateFileProgress, updateFileStatus } from '../../features/filesSlice';
import './Files.css'; 
import { sendFileInChunks, receiverInstance } from '../../utils/fileTransfer';
import { createMockConnection } from '../../features/connection/mockConnectionService';

const Wrapper = styled.div({
  position: 'relative', zIndex: 1, minHeight: '100%', display: 'flex',
  alignItems: 'center', justifyContent: 'center', padding: 24,
});

const Card = styled.section(({ theme }) => ({
  position: 'relative', 
  maxWidth: 600, 
  width: '100%', background: theme.colors.glassBg,
  backdropFilter: theme.blurs.glass, WebkitBackdropFilter: theme.blurs.glass,
  border: `1px solid ${theme.colors.glassBorder}`, borderRadius: theme.radii.xl,
  padding: 32, textAlign: 'center',
  boxShadow: `inset 0 1px 0 ${theme.colors.glassHighlight}, 0 24px 64px rgba(0,0,0,0.5)`,
}));

const Heading = styled.h1(({ theme }) => ({
  fontSize: 22, margin: '0 0 24px', fontWeight: 700, letterSpacing: '-0.01em', color: '#fff'
}));

const RoomId = styled.span(({ theme }) => ({
  fontFamily: theme.fonts.mono, color: theme.colors.cyan, fontWeight: 600,
}));

export function Files() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const dispatch = useDispatch();
  
  const isDragging = useSelector((state) => state.files.isDragging);
  const filesList = useSelector((state) => state.files.list);
  const peerId = useSelector((state) => state.connection?.peerId || crypto.randomUUID());

  // Ссылка на соединение Севы
  const connectionRef = useRef(null);

  // === ИНИЦИАЛИЗАЦИЯ СВЯЗИ ===
  useEffect(() => {
    // Создаем канал связи
    connectionRef.current = createMockConnection({
      roomId: roomId,
      peerId: peerId,
      profile: { name: 'User' },
      handlers: {
        // Ловим файлы от других пользователей
        onFileEvent: (data) => {
          const message = data.payload;

          if (message.type === 'file-start') {
            dispatch(addIncomingFile({
              id: message.fileId,
              name: message.name,
              size: message.size,
              type: message.fileType
            }));
          }

          // Отдаем куски твоему классу-сборщику
          receiverInstance.handleIncomingData(
            message,
            // Обновляем прогресс
            (fileId, progress) => {
              dispatch(updateFileProgress({ id: fileId, progress }));
            },
            // Файл собран -> показываем кнопку скачать
            (fileId, downloadUrl) => {
              dispatch(updateFileStatus({ id: fileId, status: 'completed', blobUrl: downloadUrl }));
            }
          );
        }
      }
    });

    return () => {
      // Отключаемся при выходе со страницы
      if (connectionRef.current) {
        connectionRef.current.disconnect();
      }
    };
  }, [roomId, peerId, dispatch]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!isDragging) dispatch(setDragging(true));
  }, [dispatch, isDragging]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    dispatch(setDragging(false));
  }, [dispatch]);

  // === ОТПРАВКА ФАЙЛА ===
  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    dispatch(setDragging(false));

    const files = Array.from(e.dataTransfer.files);
    
    for (const file of files) {
      const fileId = Date.now() + '-' + file.name;
      
      dispatch(addOutgoingFile({ id: fileId, name: file.name, size: file.size, type: file.type }));

      await sendFileInChunks(
        file, 
        fileId, 
        (chunkMessage) => {
          // Отправляем кусок через сервис Севы!
          if (connectionRef.current) {
            connectionRef.current.sendFileEvent(chunkMessage);
          }
        },
        (progress) => {
          dispatch(updateFileProgress({ id: fileId, progress }));
          if (progress === 100) {
             dispatch(updateFileStatus({ id: fileId, status: 'completed' }));
          }
        }
      );
    }
  }, [dispatch]);

  return (
    <Wrapper>
      <Card>
        <Heading>Файлы комнаты: <RoomId>{roomId}</RoomId></Heading>
        
        <div className="files-screen">
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
                   
                   {/* Если файл входящий и загрузился -> показываем кнопку "Скачать" */}
                   {file.status === 'completed' && file.direction === 'incoming' && file.blobUrl ? (
                      <a href={file.blobUrl} download={file.name} style={{ color: '#00ffff', textDecoration: 'none', fontWeight: 'bold' }}>
                        💾 Скачать
                      </a>
                   ) : (
                      <span>{file.status === 'completed' ? '✅' : '⏳'}</span>
                   )}
                 </div>
                 <div className="progress-bar-container">
                   {/* Если статус completed, принудительно рисуем 100%, иначе берем прогресс. Если прогресса нет - 0% */}
                  <div className="progress-bar" style={{ width: `${file.status === 'completed' ? 100 : (file.progress || 0)}%` }}></div>
                 </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
            <Button variant="secondary" onClick={() => navigate('/')}>
            Выйти в лобби
            </Button>
        </div>
      </Card>
    </Wrapper>
  );
}