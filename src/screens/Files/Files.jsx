import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { Button } from '../../components/Button';
import {
  setDragging,
  addOutgoingFile,
  addIncomingFile,
  updateFileProgress,
  updateFileStatus,
} from '../../features/files/filesSlice';
import { sendFileInChunks, receiverInstance } from '../../utils/fileTransfer';
import { createMockConnection } from '../../features/connection/mockConnectionService';

const Wrapper = styled.div({
  position: 'relative',
  zIndex: 1,
  minHeight: '100%',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: 24,
});

const Card = styled.section(({ theme }) => ({
  position: 'relative',
  maxWidth: 640,
  width: '100%',
  background: theme.colors.glassBg,
  backdropFilter: theme.blurs.glass,
  WebkitBackdropFilter: theme.blurs.glass,
  border: `1px solid ${theme.colors.glassBorder}`,
  borderRadius: theme.radii.xl,
  padding: 32,
  boxShadow: `
    inset 0 1px 0 ${theme.colors.glassHighlight},
    0 24px 64px rgba(0, 0, 0, 0.5)
  `,
}));

const Heading = styled.h1(({ theme }) => ({
  fontSize: 22,
  margin: '0 0 24px',
  fontWeight: 700,
  letterSpacing: '-0.01em',
  textAlign: 'center',
  color: theme.colors.text,
}));

const RoomId = styled.span(({ theme }) => ({
  fontFamily: theme.fonts.mono,
  color: theme.colors.cyan,
  fontWeight: 600,
}));

const DropZone = styled.div(({ theme, active }) => ({
  border: `2px dashed ${active ? theme.colors.cyan : theme.colors.borderStrong}`,
  borderRadius: theme.radii.lg,
  padding: '48px 24px',
  textAlign: 'center',
  background: active ? theme.colors.cyanSoft : theme.colors.glassBg,
  backdropFilter: theme.blurs.glassLight,
  WebkitBackdropFilter: theme.blurs.glassLight,
  transition: 'all 0.2s ease',
  marginBottom: 24,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 14,
  boxShadow: active
    ? `inset 0 1px 0 ${theme.colors.glassHighlight}, 0 0 24px ${theme.colors.cyanSoft}`
    : `inset 0 1px 0 ${theme.colors.glassHighlight}`,
}));

const DropHint = styled.p(({ theme }) => ({
  margin: 0,
  color: theme.colors.textMuted,
  fontSize: 14,
}));

const HiddenInput = styled.input({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  border: 0,
});

const FileList = styled.ul({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
});

const FileItem = styled.li(({ theme }) => ({
  background: theme.colors.glassBg,
  border: `1px solid ${theme.colors.glassBorder}`,
  borderRadius: theme.radii.md,
  padding: '12px 14px',
  boxShadow: `inset 0 1px 0 ${theme.colors.glassHighlight}`,
  display: 'flex',
  gap: 12,
  alignItems: 'center',
}));

const Thumb = styled.div(({ theme }) => ({
  flexShrink: 0,
  width: 48,
  height: 48,
  borderRadius: theme.radii.sm,
  background: theme.colors.bg3,
  border: `1px solid ${theme.colors.glassBorder}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  fontSize: 22,
  lineHeight: 1,
}));

const ThumbImg = styled.img({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
});

const FileBody = styled.div({
  minWidth: 0,
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
});

const FileInfo = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 10,
  fontSize: 14,
  color: theme.colors.text,
}));

const FileName = styled.span({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
  flex: 1,
});

const FileMeta = styled.span(({ theme }) => ({
  color: theme.colors.textFaint,
  fontSize: 12,
  fontFamily: theme.fonts.mono,
  flexShrink: 0,
}));

const DownloadLink = styled.a(({ theme }) => ({
  color: theme.colors.cyan,
  fontWeight: 600,
  textDecoration: 'none',
  fontSize: 13,
  flexShrink: 0,
  '&:hover': { textDecoration: 'underline' },
}));

const StatusBadge = styled.span(({ theme, status }) => {
  const tone =
    status === 'completed'
      ? theme.colors.emerald
      : status === 'error'
        ? theme.colors.danger
        : theme.colors.textMuted;
  return {
    fontSize: 12,
    color: tone,
    flexShrink: 0,
  };
});

const ProgressTrack = styled.div(({ theme }) => ({
  width: '100%',
  height: 6,
  background: theme.colors.bg3,
  borderRadius: 3,
  overflow: 'hidden',
}));

const ProgressFill = styled.div(({ theme, value, done }) => ({
  height: '100%',
  width: `${value}%`,
  background: done
    ? `linear-gradient(90deg, ${theme.colors.emerald}, ${theme.colors.cyan})`
    : `linear-gradient(90deg, ${theme.colors.cyan}, ${theme.colors.accent})`,
  borderRadius: 3,
  transition: 'width 0.2s ease',
  boxShadow: `0 0 12px ${done ? theme.colors.emeraldSoft : theme.colors.cyanSoft}`,
}));

const Footer = styled.div({
  marginTop: 24,
  display: 'flex',
  justifyContent: 'center',
});

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const isImageType = (type) => typeof type === 'string' && type.startsWith('image/');

const iconForType = (type = '', name = '') => {
  if (type.startsWith('video/')) return '🎬';
  if (type.startsWith('audio/')) return '🎵';
  if (type === 'application/pdf') return '📕';
  if (type.startsWith('text/') || /\.(txt|md|log)$/i.test(name)) return '📄';
  if (
    /(zip|rar|7z|tar|gz|bz2)/i.test(type) ||
    /\.(zip|rar|7z|tar|gz|bz2)$/i.test(name)
  ) {
    return '🗜️';
  }
  if (
    /word|excel|powerpoint|sheet|presentation|document/i.test(type) ||
    /\.(docx?|xlsx?|pptx?)$/i.test(name)
  ) {
    return '📊';
  }
  return '📁';
};

const statusLabel = (file) => {
  if (file.status === 'completed') return '✅';
  if (file.status === 'error') return '⚠';
  if (file.direction === 'incoming') return '⬇';
  return '⬆';
};

export function Files() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const dispatch = useDispatch();

  const isDragging = useSelector((state) => state.files.isDragging);
  const filesList = useSelector((state) => state.files.list);

  // peerId фиксируется один раз на маунт, иначе ре-рендер каждый раз даёт новый
  // — приёмник вкладки не отличит свои события от чужих.
  const [peerId] = useState(() => crypto.randomUUID());

  const connectionRef = useRef(null);
  const fileInputRef = useRef(null);
  // Локальный реестр blob-URLов превью, чтобы при размонтировании их освободить.
  const previewUrlsRef = useRef([]);
  const fileInputId = 'files-screen-input';

  useEffect(() => {
    connectionRef.current = createMockConnection({
      roomId,
      peerId,
      profile: { name: 'User' },
      handlers: {
        // mockConnectionService отдаёт уже распакованный payload (само chunk-сообщение)
        onFileEvent: (message) => {
          if (!message) return;

          if (message.type === 'file-start') {
            dispatch(
              addIncomingFile({
                id: message.fileId,
                name: message.name,
                size: message.size,
                type: message.fileType,
              }),
            );
          }

          receiverInstance.handleIncomingData(
            message,
            (fileId, progress) => {
              dispatch(updateFileProgress({ id: fileId, progress }));
            },
            (fileId, downloadUrl) => {
              dispatch(
                updateFileStatus({
                  id: fileId,
                  status: 'completed',
                  blobUrl: downloadUrl,
                }),
              );
            },
          );
        },
      },
    });

    return () => {
      if (connectionRef.current) connectionRef.current.disconnect();
      // освобождаем blob-URL'ы превью, иначе File будет жить в памяти
      for (const url of previewUrlsRef.current) {
        try {
          URL.revokeObjectURL(url);
        } catch {
          /* no-op */
        }
      }
      previewUrlsRef.current = [];
    };
  }, [roomId, peerId, dispatch]);

  const handleDragOver = useCallback(
    (e) => {
      e.preventDefault();
      if (!isDragging) dispatch(setDragging(true));
    },
    [dispatch, isDragging],
  );

  const handleDragLeave = useCallback(
    (e) => {
      e.preventDefault();
      dispatch(setDragging(false));
    },
    [dispatch],
  );

  const handleFiles = useCallback(
    async (files) => {
      for (const file of files) {
        const fileId = crypto.randomUUID();
        const previewUrl = isImageType(file.type)
          ? URL.createObjectURL(file)
          : null;
        if (previewUrl) previewUrlsRef.current.push(previewUrl);

        dispatch(
          addOutgoingFile({
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type,
            previewUrl,
          }),
        );

        await sendFileInChunks(
          file,
          fileId,
          (chunkMessage) => {
            connectionRef.current?.sendFileEvent(chunkMessage);
          },
          (progress) => {
            dispatch(updateFileProgress({ id: fileId, progress }));
            if (progress === 100) {
              dispatch(updateFileStatus({ id: fileId, status: 'completed' }));
            }
          },
        );
      }
    },
    [dispatch],
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      dispatch(setDragging(false));
      const files = Array.from(e.dataTransfer.files);
      if (files.length) handleFiles(files);
    },
    [dispatch, handleFiles],
  );

  const handlePick = useCallback(
    (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length) handleFiles(files);
      // Сбросим, чтобы повторный выбор того же файла триггерил onChange
      e.target.value = '';
    },
    [handleFiles],
  );

  const sortedFiles = useMemo(() => filesList, [filesList]);

  const renderThumb = (file) => {
    // Для отправителя сразу есть previewUrl, для получателя — после file-end blobUrl
    const imgSrc = file.previewUrl || (isImageType(file.type) ? file.blobUrl : null);
    if (imgSrc) {
      return (
        <Thumb>
          <ThumbImg src={imgSrc} alt="" />
        </Thumb>
      );
    }
    return (
      <Thumb aria-hidden="true">{iconForType(file.type, file.name)}</Thumb>
    );
  };

  return (
    <Wrapper>
      <Card>
        <Heading>
          Файлы — <RoomId>{roomId}</RoomId>
        </Heading>

        <DropZone
          active={isDragging}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-label="Перетащи файлы или выбери на устройстве"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <DropHint>
            {isDragging ? 'Бросай сюда' : 'Перетащи файлы или нажми, чтобы выбрать'}
          </DropHint>
          <Button
            variant="secondary"
            size="md"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Выбрать файлы
          </Button>
          <HiddenInput
            ref={fileInputRef}
            id={fileInputId}
            type="file"
            multiple
            onChange={handlePick}
            aria-label="Выбрать файлы для отправки"
          />
        </DropZone>

        {sortedFiles.length > 0 ? (
          <FileList aria-label="Список передач">
            {sortedFiles.map((file) => {
              const progress = file.status === 'completed' ? 100 : file.progress || 0;
              const done = file.status === 'completed';
              return (
                <FileItem key={file.id}>
                  {renderThumb(file)}
                  <FileBody>
                    <FileInfo>
                      <FileName title={file.name}>{file.name}</FileName>
                      <FileMeta>{formatSize(file.size)}</FileMeta>
                      {done && file.direction === 'incoming' && file.blobUrl ? (
                        <DownloadLink href={file.blobUrl} download={file.name}>
                          Скачать
                        </DownloadLink>
                      ) : (
                        <StatusBadge
                          status={file.status}
                          aria-label={`Статус ${file.status}`}
                        >
                          {statusLabel(file)}
                        </StatusBadge>
                      )}
                    </FileInfo>
                    <ProgressTrack
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Прогресс ${file.name}`}
                    >
                      <ProgressFill value={progress} done={done} />
                    </ProgressTrack>
                  </FileBody>
                </FileItem>
              );
            })}
          </FileList>
        ) : null}

        <Footer>
          <Button variant="secondary" onClick={() => navigate('/')}>
            Выйти в лобби
          </Button>
        </Footer>
      </Card>
    </Wrapper>
  );
}
