import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { Button } from '../../components/Button';
import { setDragging, addOutgoingFile, updateFileProgress, updateFileStatus } from '../../features/filesSlice';
import './Files.css'; 

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

// --- НАША ЛОГИКА ---
export function Files() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  
  const dispatch = useDispatch();
  const isDragging = useSelector((state) => state.files.isDragging);
  const filesList = useSelector((state) => state.files.list);

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
      dispatch(addOutgoingFile({ id: fileId, name: file.name, size: file.size, type: file.type }));
      simulateUpload(fileId);
    });
  }, [dispatch]);

  return (
    <Wrapper>
      <Card>
        <Heading>Файлы комнаты: <RoomId>{roomId}</RoomId></Heading>
        
        {/* НАША ЗОНА DRAG AND DROP */}
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
                   <span>{file.status === 'completed' ? '✅' : '⏳'}</span>
                 </div>
                 <div className="progress-bar-container">
                   <div className="progress-bar" style={{ width: `${file.progress}%` }}></div>
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