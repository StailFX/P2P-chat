import styled from '@emotion/styled';

const MessageRow = styled.article(({ isOwn, isSystem }) => ({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: isSystem ? 'center' : isOwn ? 'flex-end' : 'flex-start',
  gap: 10,
}));

const MessageAvatar = styled.div(({ theme }) => ({
  flex: '0 0 auto',
  width: 42,
  height: 42,
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  fontSize: 24,
  background: 'rgba(255, 255, 255, 0.10)',
  border: `1px solid ${theme.colors.glassBorder}`,
  boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
}));

const MessageBubble = styled.div(({ theme, isOwn, isSystem }) => ({
  maxWidth: isSystem ? '80%' : '70%',
  padding: isSystem ? '8px 12px' : '10px 12px',
  borderRadius: theme.radii.lg,
  background: isSystem
    ? 'rgba(148, 163, 184, 0.12)'
    : isOwn
      ? 'rgba(34, 211, 238, 0.14)'
      : 'rgba(255, 255, 255, 0.08)',
  border: `1px solid ${theme.colors.glassBorder}`,
  textAlign: isSystem ? 'center' : 'left',
}));

const MessageMeta = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  marginBottom: 4,
  fontSize: 13,
});

const MessageText = styled.p(({ theme }) => ({
  margin: 0,
  color: theme.colors.text,
  fontSize: 14,
  lineHeight: 1.45,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
}));

const MessageTime = styled.time(({ theme }) => ({
  display: 'block',
  marginTop: 6,
  color: theme.colors.textMuted,
  fontSize: 11,
}));

export function ChatMessageItem({ message, isOwn }) {
  const isSystem = message.type === 'system';

  return (
    <MessageRow isOwn={isOwn} isSystem={isSystem}>
      {isSystem ? (
        <MessageBubble isSystem>
          <MessageText>{message.text}</MessageText>
        </MessageBubble>
      ) : (
        <>
          {!isOwn && (
            <MessageAvatar aria-hidden="true">
              {message.senderAvatar}
            </MessageAvatar>
          )}

          <MessageBubble isOwn={isOwn}>
            <MessageMeta>
              <strong style={{ color: message.senderColor }}>
                {message.senderNickname}
              </strong>
            </MessageMeta>

            <MessageText>{message.text}</MessageText>

            <MessageTime dateTime={message.createdAt}>
              {new Date(message.createdAt).toLocaleTimeString()}
            </MessageTime>
          </MessageBubble>

          {isOwn && (
            <MessageAvatar aria-hidden="true">
              {message.senderAvatar}
            </MessageAvatar>
          )}
        </>
      )}
    </MessageRow>
  );
}