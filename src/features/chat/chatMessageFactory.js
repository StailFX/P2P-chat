import { createId } from '../../utils/createId';

export function createChatMessage({
  roomId,
  senderId,
  profile,
  text,
}) {
  return {
    id: createId('message'),
    roomId,
    senderId,
    senderNickname: profile.nickname,
    senderAvatar: profile.avatar,
    senderColor: profile.nicknameColor,
    text,
    createdAt: new Date().toISOString(),
    type: 'message',
  };
}