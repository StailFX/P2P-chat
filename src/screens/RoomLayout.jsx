import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';

import { joinRoom, leaveRoom } from '../features/room/roomSlice';

import {
  addMessage,
  addSystemMessage,
  clearMessages,
} from '../features/chat/chatSlice';

import {
  closeConnection,
  initConnection,
  setConnectionStatus,
  setFileChannelReady,
  setMessageChannelReady,
  setRemotePeer,
} from '../features/connection/connectionSlice';

import { selectPeerId } from '../features/connection/connectionSelectors';

import { createMockConnection } from '../features/connection/mockConnectionService';

const Shell = styled.div({
  position: 'relative',
  zIndex: 1,
  height: '100dvh',
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

const Tabs = styled.nav(({ theme }) => ({
  flex: '0 0 auto',
  display: 'flex',
  gap: 6,
  padding: '12px 20px',
  background: theme.colors.glassBg,
  backdropFilter: theme.blurs.glass,
  WebkitBackdropFilter: theme.blurs.glass,
  borderBottom: `1px solid ${theme.colors.glassBorder}`,
}));

const Tab = styled(NavLink)(({ theme }) => ({
  background: 'transparent',
  border: '1px solid transparent',
  color: theme.colors.textMuted,
  padding: '8px 18px',
  borderRadius: theme.radii.md,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
  textDecoration: 'none',
  transition: 'background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s',

  '&:hover': {
    background: theme.colors.glassBg,
    color: theme.colors.text,
  },

  '&.active': {
    background: theme.colors.cyanSoft,
    borderColor: theme.colors.cyan,
    color: theme.colors.text,
    boxShadow: `inset 0 1px 0 ${theme.colors.glassHighlight}, 0 0 16px ${theme.colors.cyanSoft}`,
  },
}));

const Main = styled.main({
  flex: '1 1 auto',
  minHeight: 0,
  overflow: 'hidden',
});

export function RoomLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { roomId } = useParams();

  const connectionRef = useRef(null);

  const peerId = useSelector(selectPeerId);
  const storedProfile = useSelector((state) => state.profile);

  const profile = {
    nickname: storedProfile?.nickname || 'Пользователь',
    avatar: storedProfile?.avatar || storedProfile?.avatarId || '🦊',
    nicknameColor: storedProfile?.nicknameColor || '#60a5fa',
  };

  useEffect(() => {
    if (!roomId) {
      return;
    }

    dispatch(joinRoom(roomId));
    dispatch(initConnection());
    dispatch(setConnectionStatus('waiting'));

    connectionRef.current = createMockConnection({
      roomId,
      peerId,
      profile,
      handlers: {
        onUserJoined: (payload) => {
          const nickname =
            payload.profile?.nickname || payload.nickname || 'Пользователь';

          dispatch(setRemotePeer(payload.peerId));
          dispatch(setConnectionStatus('connected'));
          dispatch(setMessageChannelReady(true));
          dispatch(setFileChannelReady(true));

          dispatch(
            addSystemMessage({
              roomId,
              text: `${nickname} подключился к комнате`,
            })
          );
        },

        onUserLeft: (payload) => {
          const nickname =
            payload.profile?.nickname || payload.nickname || 'Пользователь';

          dispatch(setConnectionStatus('disconnected'));
          dispatch(setMessageChannelReady(false));
          dispatch(setFileChannelReady(false));

          dispatch(
            addSystemMessage({
              roomId,
              text: `${nickname} покинул комнату`,
            })
          );
        },

        onMessage: (message) => {
          dispatch(addMessage(message));
        },

        onFileEvent: (payload) => {
          console.log('[FILE EVENT]', payload);
        },
      },
    });

    dispatch(
      addSystemMessage({
        roomId,
        text: 'Вы вошли в комнату. Ожидание второго участника...',
      })
    );

    const handlePageClose = () => {
      connectionRef.current?.disconnect();
    };

    window.addEventListener('pagehide', handlePageClose);
    window.addEventListener('beforeunload', handlePageClose);

    return () => {
      window.removeEventListener('pagehide', handlePageClose);
      window.removeEventListener('beforeunload', handlePageClose);

      connectionRef.current?.disconnect();
      connectionRef.current = null;

      dispatch(closeConnection());
      dispatch(leaveRoom());
    };
  }, [dispatch, roomId, peerId]);

  const handleLeaveRoom = () => {
    connectionRef.current?.disconnect();
    connectionRef.current = null;

    dispatch(clearMessages());
    dispatch(closeConnection());
    dispatch(leaveRoom());

    navigate('/');
  };

  return (
    <Shell>
      <Tabs aria-label="Разделы комнаты">
        <Tab to={`/room/${roomId}/chat`}>Чат</Tab>
        <Tab to={`/room/${roomId}/files`}>Файлы</Tab>
      </Tabs>

      <Main>
        <Outlet
          context={{
            connectionRef,
            handleLeaveRoom,
          }}
        />
      </Main>
    </Shell>
  );
}