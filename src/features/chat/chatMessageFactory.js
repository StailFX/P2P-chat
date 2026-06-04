export function createChatMessage({
  roomId,
  senderId,
  profile,
  text,
}) {
  return {
    id: crypto.randomUUID(),
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