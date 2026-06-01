import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { joinRoom, leaveRoom } from '../features/room/roomSlice';

const Shell = styled.div({
  minHeight: '100%',
  display: 'flex',
  flexDirection: 'column',
});

const Tabs = styled.nav(({ theme }) => ({
  display: 'flex',
  gap: 4,
  padding: '10px 16px',
  background: theme.colors.bg1,
  borderBottom: `1px solid ${theme.colors.border}`,
}));

const Tab = styled(NavLink)(({ theme }) => ({
  background: 'transparent',
  border: '1px solid transparent',
  color: theme.colors.textMuted,
  padding: '8px 16px',
  borderRadius: theme.radii.md,
  cursor: 'pointer',
  fontSize: 14,
  textDecoration: 'none',
  transition: 'background 0.15s, color 0.15s, border-color 0.15s',
  '&:hover': {
    background: theme.colors.bg2,
    color: theme.colors.text,
  },
  '&.active': {
    background: theme.colors.accentSoft,
    borderColor: theme.colors.accent,
    color: theme.colors.text,
  },
}));

const Main = styled.main({ flex: 1, minHeight: 0 });

export function RoomLayout() {
  const dispatch = useDispatch();
  const { roomId } = useParams();

  useEffect(() => {
    if (!roomId) return;
    dispatch(joinRoom(roomId));
    return () => {
      dispatch(leaveRoom());
    };
  }, [dispatch, roomId]);

  return (
    <Shell>
      <Tabs aria-label="Разделы комнаты">
        <Tab to={`/room/${roomId}/chat`}>Чат</Tab>
        <Tab to={`/room/${roomId}/files`}>Файлы</Tab>
      </Tabs>
      <Main>
        <Outlet />
      </Main>
    </Shell>
  );
}
