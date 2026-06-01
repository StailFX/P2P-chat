import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import {
  setNickname,
  setAvatar,
  setNicknameColor,
  loadProfileFromStorage,
  saveProfileToStorage,
  validateProfile,
  selectProfile,
} from '../../features/profile/profileSlice';
import {
  addRecentRoom,
  removeRecentRoom,
  loadRecentRoomsFromStorage,
  selectRecentRooms,
} from '../../features/room/roomSlice';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { AvatarPicker } from '../../components/AvatarPicker';
import { ColorPicker } from '../../components/ColorPicker';
import { getAvatarById } from '../../constants/avatars';
import { getColorById } from '../../constants/colors';

const generateRoomId = () => {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
};

const ROOM_ID_RE = /^[a-z0-9]{4,12}$/i;

const formatLastVisited = (ts) => {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'только что';
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.floor(h / 24);
  return `${d} дн назад`;
};

const Page = styled.div(({ theme }) => ({
  minHeight: '100%',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: '48px 16px',
  background: `radial-gradient(ellipse at top, rgba(110, 168, 254, 0.08), transparent 60%), ${theme.colors.bg0}`,
  [`@media (max-width: ${theme.breakpoints.mobile})`]: { padding: '24px 12px' },
}));

const Card = styled.section(({ theme }) => ({
  width: '100%',
  maxWidth: 520,
  background: theme.colors.bg1,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radii.lg,
  padding: '28px 28px 32px',
  boxShadow: theme.shadows.md,
  [`@media (max-width: ${theme.breakpoints.mobile})`]: { padding: 20 },
}));

const Header = styled.header({
  textAlign: 'center',
  marginBottom: 24,
});

const Title = styled.h1({
  fontSize: 26,
  margin: '0 0 6px',
  letterSpacing: '-0.01em',
});

const Subtitle = styled.p(({ theme }) => ({
  margin: 0,
  color: theme.colors.textMuted,
  fontSize: 13,
}));

const Section = styled.section({
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  marginBottom: 22,
  '&:last-child': { marginBottom: 0 },
});

const SectionTitle = styled.h2(({ theme }) => ({
  fontSize: 13,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: theme.colors.textMuted,
  margin: 0,
}));

const Row = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

const RowLabel = styled.span(({ theme }) => ({
  fontSize: 12,
  color: theme.colors.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}));

const ProfilePreview = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: '14px 16px',
  background: theme.colors.bg2,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radii.md,
}));

const ProfileAvatar = styled.div(({ theme }) => ({
  width: 44,
  height: 44,
  borderRadius: '50%',
  background: theme.colors.bg3,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 24,
}));

const ProfileName = styled.div(({ color }) => ({
  fontSize: 16,
  fontWeight: 600,
  color,
}));

const Divider = styled.div(({ theme }) => ({
  height: 1,
  background: theme.colors.border,
  margin: '6px 0 22px',
}));

const JoinForm = styled.form(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: 10,
  alignItems: 'end',
  [`@media (max-width: ${theme.breakpoints.mobile})`]: {
    gridTemplateColumns: '1fr',
  },
}));

const RecentList = styled.ul({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
});

const RecentItem = styled.li(({ theme }) => ({
  display: 'flex',
  gap: 4,
  background: theme.colors.bg2,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radii.md,
  overflow: 'hidden',
}));

const RecentMain = styled.button(({ theme }) => ({
  flex: 1,
  background: 'transparent',
  border: 'none',
  padding: '10px 14px',
  textAlign: 'left',
  cursor: 'pointer',
  color: theme.colors.text,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  '&:not(:disabled):hover': { background: theme.colors.bg3 },
  '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
}));

const RecentId = styled.span(({ theme }) => ({
  fontFamily: theme.fonts.mono,
  fontSize: 14,
}));

const RecentTime = styled.span(({ theme }) => ({
  fontSize: 12,
  color: theme.colors.textFaint,
}));

const RecentRemove = styled.button(({ theme }) => ({
  background: 'transparent',
  border: 'none',
  color: theme.colors.textFaint,
  cursor: 'pointer',
  padding: '0 14px',
  fontSize: 20,
  lineHeight: 1,
  '&:hover': {
    color: theme.colors.danger,
    background: theme.colors.dangerSoft,
  },
}));

export function Lobby() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profile = useSelector(selectProfile);
  const recentRooms = useSelector(selectRecentRooms);

  const [roomIdInput, setRoomIdInput] = useState('');
  const [roomIdError, setRoomIdError] = useState(null);

  useEffect(() => {
    dispatch(loadProfileFromStorage());
    dispatch(loadRecentRoomsFromStorage());
    dispatch(validateProfile());
  }, [dispatch]);

  const avatar = useMemo(() => getAvatarById(profile.avatarId), [profile.avatarId]);
  const color = useMemo(() => getColorById(profile.nicknameColor), [profile.nicknameColor]);

  const validateRoomId = (id) => {
    if (!id) return 'Введи ID комнаты';
    if (!ROOM_ID_RE.test(id)) return 'ID: 4–12 символов, латиница и цифры';
    return null;
  };

  const enter = (roomId) => {
    dispatch(saveProfileToStorage());
    if (!profile.isValid) return;
    dispatch(addRecentRoom(roomId));
    navigate(`/room/${roomId}/chat`);
  };

  const handleCreate = () => {
    if (!profile.isValid) {
      dispatch(validateProfile());
      return;
    }
    enter(generateRoomId());
  };

  const handleJoin = (e) => {
    e.preventDefault();
    const err = validateRoomId(roomIdInput.trim());
    setRoomIdError(err);
    if (err) return;
    if (!profile.isValid) {
      dispatch(validateProfile());
      return;
    }
    enter(roomIdInput.trim().toLowerCase());
  };

  const handleRecent = (roomId) => {
    if (!profile.isValid) {
      dispatch(validateProfile());
      return;
    }
    enter(roomId);
  };

  return (
    <Page>
      <Card aria-labelledby="lobby-title">
        <Header>
          <Title id="lobby-title">P2P Chat</Title>
          <Subtitle>
            Чат и обмен файлами без сервера. Создай комнату или зайди по ID.
          </Subtitle>
        </Header>

        <Section aria-labelledby="profile-title">
          <SectionTitle id="profile-title">Профиль</SectionTitle>
          <ProfilePreview>
            <ProfileAvatar aria-hidden="true">{avatar.emoji}</ProfileAvatar>
            <ProfileName color={color.value}>
              {profile.nickname || 'Без имени'}
            </ProfileName>
          </ProfilePreview>

          <Input
            id="nickname"
            label="Ник"
            value={profile.nickname}
            onChange={(v) => dispatch(setNickname(v))}
            placeholder="Например, Никита"
            maxLength={20}
            error={profile.nickname ? profile.error : null}
          />

          <Row>
            <RowLabel as="span">Цвет ника</RowLabel>
            <ColorPicker
              value={profile.nicknameColor}
              onChange={(id) => dispatch(setNicknameColor(id))}
            />
          </Row>

          <Row>
            <RowLabel as="span">Аватар</RowLabel>
            <AvatarPicker
              value={profile.avatarId}
              onChange={(id) => dispatch(setAvatar(id))}
            />
          </Row>
        </Section>

        <Divider />

        <Section aria-labelledby="create-title">
          <SectionTitle id="create-title">Создать комнату</SectionTitle>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleCreate}
            disabled={!profile.isValid}
          >
            Создать новую комнату
          </Button>
        </Section>

        <Section aria-labelledby="join-title">
          <SectionTitle id="join-title">Зайти по ID</SectionTitle>
          <JoinForm onSubmit={handleJoin} noValidate>
            <Input
              id="roomId"
              value={roomIdInput}
              onChange={(v) => {
                setRoomIdInput(v);
                if (roomIdError) setRoomIdError(null);
              }}
              placeholder="например, k7m2pz"
              maxLength={12}
              error={roomIdError}
            />
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              disabled={!profile.isValid}
            >
              Войти
            </Button>
          </JoinForm>
        </Section>

        {recentRooms.length > 0 ? (
          <Section aria-labelledby="recent-title">
            <SectionTitle id="recent-title">Недавние комнаты</SectionTitle>
            <RecentList>
              {recentRooms.map((r) => (
                <RecentItem key={r.roomId}>
                  <RecentMain
                    type="button"
                    onClick={() => handleRecent(r.roomId)}
                    disabled={!profile.isValid}
                  >
                    <RecentId>{r.roomId}</RecentId>
                    <RecentTime>{formatLastVisited(r.lastVisitedAt)}</RecentTime>
                  </RecentMain>
                  <RecentRemove
                    type="button"
                    onClick={() => dispatch(removeRecentRoom(r.roomId))}
                    aria-label={`Удалить ${r.roomId} из недавних`}
                    title="Удалить"
                  >
                    ×
                  </RecentRemove>
                </RecentItem>
              ))}
            </RecentList>
          </Section>
        ) : null}
      </Card>
    </Page>
  );
}
