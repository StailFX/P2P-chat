import { useEffect, useRef, useState, useCallback } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { AVATARS } from '../../constants/avatars';

import { ChatHeader } from '../../features/chat/components/ChatHeader';
import { ChatMessageList } from '../../features/chat/components/ChatMessageList';
import { ChatMessageInput } from '../../features/chat/components/ChatMessageInput';

import {
  addMessage,
  addSystemMessage,
  setError as setChatError,
  setInputValue,
  setSendStatus,
} from '../../features/chat/chatSlice';

import {
  selectChatError,
  selectChatInputValue,
  selectChatMessages,
} from '../../features/chat/chatSelectors';

import { validateMessage } from '../../features/chat/chatValidation';
import { createChatMessage } from '../../features/chat/chatMessageFactory';

import {
  selectConnectionStatus,
  selectMessageChannelReady,
  selectPeerId,
} from '../../features/connection/connectionSelectors';


function getAvatarById(avatarId) {
  return AVATARS.find((avatar) => avatar.id === avatarId)?.emoji || '🦊';
}

const Wrapper = styled.div({
  position: 'relative',
  zIndex: 1,
  height: '100%',
  minHeight: 0,
  display: 'flex',
  alignItems: 'stretch',
  justifyContent: 'center',
  padding: '24px 24px 32px',
  boxSizing: 'border-box',
  overflow: 'hidden',
});

const Card = styled.section(({ theme }) => ({
  position: 'relative',
  maxWidth: 760,
  width: '100%',
  height: '100%',
  minHeight: 0,
  background: theme.colors.glassBg,
  backdropFilter: theme.blurs.glass,
  WebkitBackdropFilter: theme.blurs.glass,
  border: `1px solid ${theme.colors.glassBorder}`,
  borderRadius: theme.radii.xl,
  padding: 24,
  boxSizing: 'border-box',
  boxShadow: `
    inset 0 1px 0 ${theme.colors.glassHighlight},
    0 24px 64px rgba(0,0,0,0.5)
  `,
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
  overflow: 'hidden',
}));

const Header = styled.header({
  flex: '0 0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
  flexWrap: 'wrap',
});

const HeaderInfo = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
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
      ? `1px solid rgba(34, 211, 238, 0.35)`
      : `1px solid ${theme.colors.glassBorder}`,
}));

const HeaderActions = styled.div({
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
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

const MessagesWrap = styled.div({
  position: 'relative',
  flex: '1 1 0',
  minHeight: 0,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
});

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

const Form = styled.form({
  flex: '0 0 auto',
  display: 'flex',
  gap: 10,
  alignItems: 'flex-start',
});

const InputWrap = styled.div({
  flex: 1,
});

const Label = styled.label({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
});

const Input = styled.input(({ theme }) => ({
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  borderRadius: theme.radii.md,
  border: `1px solid ${theme.colors.glassBorder}`,
  background: 'rgba(15, 23, 42, 0.55)',
  color: theme.colors.text,
  outline: 'none',
  fontSize: 14,

  '&::placeholder': {
    color: theme.colors.textMuted,
  },

  '&:focus': {
    borderColor: theme.colors.cyan,
  },

  '&:disabled': {
    cursor: 'not-allowed',
    opacity: 0.6,
  },
}));

const ErrorText = styled.p(({ theme }) => ({
  margin: '6px 0 0',
  color: theme.colors.red || '#fb7185',
  fontSize: 12,
}));

const DisabledHint = styled.p(({ theme }) => ({
  margin: '6px 0 0',
  color: theme.colors.textMuted,
  fontSize: 12,
}));

function getStatusText(status) {
  const statuses = {
    disconnected: 'Не подключено',
    waiting: 'Ожидание второго участника',
    waiting_peer: 'Ожидание второго участника',
    connecting: 'Подключение...',
    connected: 'Соединение установлено',
    failed: 'Ошибка соединения',
  };

  return statuses[status] || status;
}

export function Chat() {
  const { roomId } = useParams();
  const dispatch = useDispatch();

  const { connectionRef, handleLeaveRoom } = useOutletContext();

  const messages = useSelector(selectChatMessages);
  const inputValue = useSelector(selectChatInputValue);
  const chatError = useSelector(selectChatError);

  const peerId = useSelector(selectPeerId);
  const connectionStatus = useSelector(selectConnectionStatus);
  const messageChannelReady = useSelector(selectMessageChannelReady);

  const storedProfile = useSelector((state) => state.profile);

  const profile = {
    nickname: storedProfile?.nickname || 'User',
    avatar: getAvatarById(storedProfile?.avatarId),
    nicknameColor: storedProfile?.nicknameColor || '#60a5fa',
  };

  const messagesEndRef = useRef(null);
  const messagesListRef = useRef(null);
  const forceScrollToBottomRef = useRef(false);
  const inputRef = useRef(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({
      behavior,
      block: 'end',
    });
  }, []);

  const checkIsNearBottom = useCallback(() => {
    const element = messagesListRef.current;

    if (!element) {
      return true;
    }

    const distanceToBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;

    return distanceToBottom < 80;
  }, []);

  const handleMessagesScroll = () => {
    setShowScrollDown(!checkIsNearBottom());
  };

  useEffect(() => {
    if (messageChannelReady) {
      inputRef.current?.focus();
    }
  }, [messageChannelReady]);

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    const lastMessage = messages[messages.length - 1];
    const isOwnLastMessage = lastMessage.senderId === peerId;

    if (forceScrollToBottomRef.current || isOwnLastMessage) {
      scrollToBottom('smooth');
      setShowScrollDown(false);
      forceScrollToBottomRef.current = false;
      return;
    }

    if (checkIsNearBottom()) {
      scrollToBottom('smooth');
      setShowScrollDown(false);
    } else {
      setShowScrollDown(true);
    }
  }, [messages.length, messages, peerId, checkIsNearBottom, scrollToBottom]);

  const handleSendMessage = () => {
    const validation = validateMessage(inputValue);

    if (!validation.valid) {
      dispatch(setChatError(validation.error));
      return;
    }

    const text = inputValue.trim();

    const message = createChatMessage({
      roomId,
      senderId: peerId,
      profile,
      text,
    });

    dispatch(setSendStatus('sending'));

    forceScrollToBottomRef.current = true;
    dispatch(addMessage(message));

    connectionRef.current?.sendMessage(message);

    dispatch(setInputValue(''));

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });  
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);

    dispatch(
      addSystemMessage({
        roomId,
        text: 'Ссылка на комнату скопирована',
      })
    );
  };

  const handleScrollDownClick = () => {
    scrollToBottom('smooth');
    setShowScrollDown(false);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const isSendDisabled = !inputValue.trim() || !messageChannelReady;

  return (
    <Wrapper>
      <Card>
        <ChatHeader
          roomId={roomId}
          connectionStatus={connectionStatus}
          onCopyLink={handleCopyLink}
          onLeaveRoom={handleLeaveRoom}
        />

        <ChatMessageList
          messages={messages}
          peerId={peerId}
          messagesListRef={messagesListRef}
          messagesEndRef={messagesEndRef}
          showScrollDown={showScrollDown}
          onScroll={handleMessagesScroll}
          onScrollDownClick={handleScrollDownClick}
        />

        <ChatMessageInput
          inputRef={inputRef}
          value={inputValue}
          error={chatError}
          disabled={!messageChannelReady}
          isSendDisabled={isSendDisabled}
          onChange={(value) => dispatch(setInputValue(value))}
          onSubmit={handleSendMessage}
        />
      </Card>
    </Wrapper>
  );
}