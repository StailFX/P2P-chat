import styled from '@emotion/styled';
import { Button } from '../../../components/Button';

const Header = styled.header(({ theme }) => ({
  flex: '0 0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
  flexWrap: 'wrap',
  [`@media (max-width: ${theme.breakpoints.mobile})`]: {
    gap: 12,
  },
}));

const HeaderInfo = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  minWidth: 0,
  flex: '1 1 auto',
});

const Heading = styled.h1({
  fontSize: 22,
  margin: 0,
  fontWeight: 700,
  letterSpacing: '-0.01em',
});

const RoomId = styled.span(({ theme }) => ({
  fontFamily: theme.fonts.mono,
  color: theme.colors.cyan,
  fontWeight: 600,
}));

const Hint = styled.p(({ theme }) => ({
  margin: 0,
  color: theme.colors.textMuted,
  fontSize: 13,
  [`@media (max-width: ${theme.breakpoints.mobile})`]: {
    display: 'none',
  },
}));

const Status = styled.span(({ theme, status }) => ({
  display: 'inline-flex',
  width: 'fit-content',
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
  color: status === 'connected' ? theme.colors.cyan : theme.colors.textMuted,
  background:
    status === 'connected'
      ? 'rgba(34, 211, 238, 0.12)'
      : 'rgba(148, 163, 184, 0.12)',
  border:
    status === 'connected'
      ? '1px solid rgba(34, 211, 238, 0.35)'
      : `1px solid ${theme.colors.glassBorder}`,
}));

const HeaderActions = styled.div(({ theme }) => ({
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  [`@media (max-width: ${theme.breakpoints.mobile})`]: {
    width: '100%',
    '& > button': {
      flex: 1,
    },
  },
}));

function getStatusText(status) {
  const statuses = {
    idle: 'Не подключено',
    disconnected: 'Не подключено',
    waiting: 'Ожидание второго участника',
    waiting_peer: 'Ожидание второго участника',
    connecting: 'Подключение...',
    connected: 'Соединение установлено',
    failed: 'Ошибка соединения',
  };

  return statuses[status] || status;
}

export function ChatHeader({
  roomId,
  connectionStatus,
  onCopyLink,
  onLeaveRoom,
}) {
  return (
    <Header>
      <HeaderInfo>
        <Heading>
          Чат — <RoomId>{roomId}</RoomId>
        </Heading>

        <Hint>Открой вторую вкладку с этой же комнатой, чтобы проверить обмен.</Hint>

        <Status status={connectionStatus}>
          {getStatusText(connectionStatus)}
        </Status>
      </HeaderInfo>

      <HeaderActions>
        <Button variant="secondary" size="sm" onClick={onCopyLink}>
          Скопировать
        </Button>

        <Button variant="secondary" size="sm" onClick={onLeaveRoom}>
          Выйти
        </Button>
      </HeaderActions>
    </Header>
  );
}
