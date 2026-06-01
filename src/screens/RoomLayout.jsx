import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { joinRoom, leaveRoom } from '../features/room/roomSlice';

const Shell = styled.div({
  position: 'relative',
  zIndex: 1,
  minHeight: '100%',
  display: 'flex',
  flexDirection: 'column',
});

const Tabs = styled.nav(({ theme }) => ({
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
