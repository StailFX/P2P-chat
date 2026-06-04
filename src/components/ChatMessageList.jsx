import styled from '@emotion/styled';
import { ChatMessageItem } from './ChatMessageItem';

const MessagesWrap = styled.div({
  position: 'relative',
  flex: '1 1 0',
  minHeight: 0,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
});

const Messages = styled.section(({ theme }) => ({
  flex: '1 1 auto',
  minHeight: 0,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: 16,
  borderRadius: theme.radii.lg,
  border: `1px solid ${theme.colors.glassBorder}`,
  background: 'rgba(15, 23, 42, 0.35)',
}));

const EmptyText = styled.p(({ theme }) => ({
  margin: 'auto',
  color: theme.colors.textMuted,
  fontSize: 14,
}));

const ScrollDownButton = styled.button(({ theme }) => ({
  position: 'absolute',
  left: '50%',
  bottom: 18,
  transform: 'translateX(-50%)',
  width: 38,
  height: 38,
  borderRadius: '50%',
  border: `1px solid ${theme.colors.glassBorder}`,
  background: 'rgba(0, 0, 0, 0.82)',
  color: theme.colors.text,
  display: 'grid',
  placeItems: 'center',
  cursor: 'pointer',
  fontSize: 18,
  fontWeight: 700,
  zIndex: 5,
  boxShadow: '0 12px 28px rgba(0,0,0,0.45)',
  transition: 'transform 0.15s, background 0.15s, opacity 0.15s',

  '&:hover': {
    background: 'rgba(0, 0, 0, 0.95)',
    transform: 'translateX(-50%) translateY(-2px)',
  },
}));

export function ChatMessageList({
  messages,
  peerId,
  messagesListRef,
  messagesEndRef,
  showScrollDown,
  onScroll,
  onScrollDownClick,
}) {
  return (
    <MessagesWrap>
      <Messages
        ref={messagesListRef}
        aria-label="Сообщения чата"
        onScroll={onScroll}
      >
        {messages.length === 0 && <EmptyText>Сообщений пока нет</EmptyText>}

        {messages.map((message) => (
          <ChatMessageItem
            key={message.id}
            message={message}
            isOwn={message.senderId === peerId}
          />
        ))}

        <div ref={messagesEndRef} />
      </Messages>

      {showScrollDown && (
        <ScrollDownButton
          type="button"
          aria-label="Прокрутить к последнему сообщению"
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          onClick={onScrollDownClick}
        >
          ↓
        </ScrollDownButton>
      )}
    </MessagesWrap>
  );
}