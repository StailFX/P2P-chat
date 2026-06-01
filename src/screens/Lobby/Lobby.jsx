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

const Page = styled.div({
  position: 'relative',
  zIndex: 1,
  minHeight: '100%',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: '56px 20px 64px',
});

const Card = styled.section(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: 540,
  background: theme.colors.glassBg,
  backdropFilter: theme.blurs.glass,
  WebkitBackdropFilter: theme.blurs.glass,
  border: `1px solid ${theme.colors.glassBorder}`,
  borderRadius: theme.radii.xl,
  padding: '36px 36px 40px',
  boxShadow: `
    inset 0 1px 0 ${theme.colors.glassHighlight},
    inset 0 -1px 0 rgba(0, 0, 0, 0.3),
    0 24px 64px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.02)
  `,
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    pointerEvents: 'none',
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 30%)',
  },
  [`@media (max-width: ${theme.breakpoints.mobile})`]: {
    padding: '24px 20px 28px',
    borderRadius: theme.radii.lg,
  },
}));

const Header = styled.header({
  textAlign: 'center',
  marginBottom: 28,
});

const Logo = styled.h1(({ theme }) => ({
  fontSize: 38,
  margin: '0 0 10px',
  letterSpacing: '-0.03em',
  fontWeight: 700,
  background: `linear-gradient(180deg, #ffffff 0%, ${theme.colors.cyan} 70%, ${theme.colors.accent} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  filter: 'drop-shadow(0 0 14px rgba(34, 211, 238, 0.22))',
}));

const Tagline = styled.p(({ theme }) => ({
  margin: 0,
  color: theme.colors.textMuted,
  fontSize: 13,
  letterSpacing: '0.02em',
}));

const BadgeRow = styled.div({
  display: 'flex',
  gap: 8,
  justifyContent: 'center',
  flexWrap: 'wrap',
  marginTop: 16,
});

const Badge = styled.span(({ theme, tone = 'success' }) => {
  const tones = {
    success: { color: theme.colors.emerald, soft: theme.colors.emeraldSoft },
    cyan: { color: theme.colors.cyan, soft: theme.colors.cyanSoft },
    violet: { color: theme.colors.violet, soft: theme.colors.violetSoft },
  };
  const t = tones[tone];
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 10px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: t.color,
    background: t.soft,
    border: `1px solid ${t.soft}`,
    '&::before': {
      content: '""',
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: t.color,
      boxShadow: `0 0 8px ${t.color}`,
    },
  };
});

const Section = styled.section({
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  marginBottom: 22,
  '&:last-child': { marginBottom: 0 },
});

const SectionTitle = styled.h2(({ theme }) => ({
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: theme.colors.textMuted,
  margin: 0,
  fontWeight: 700,
}));

const Row = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
});

const RowLabel = styled.span(({ theme }) => ({
  fontSize: 11,
  color: theme.colors.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: 600,
}));

const ProfilePreview = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: '14px 18px',
  background: theme.colors.glassBg,
  border: `1px solid ${theme.colors.glassBorder}`,
  borderRadius: theme.radii.lg,
  boxShadow: `inset 0 1px 0 ${theme.colors.glassHighlight}`,
}));

const ProfileAvatar = styled.div(({ theme, glowColor }) => ({
  width: 48,
  height: 48,
  borderRadius: '50%',
  background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent 60%), ${theme.colors.bg2}`,
  border: `1px solid ${theme.colors.glassBorder}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 26,
  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 0 24px ${glowColor || 'transparent'}`,
}));

const ProfileName = styled.div(({ color }) => ({
  fontSize: 17,
  fontWeight: 600,
  color,
  letterSpacing: '0.01em',
  textShadow: `0 0 16px ${color}40`,
}));

const Divider = styled.div(({ theme }) => ({
  height: 1,
  background: `linear-gradient(90deg, transparent, ${theme.colors.glassBorder}, transparent)`,
  margin: '8px 0 20px',
}));

const JoinForm = styled.form(({ theme }) => ({
  display: 'flex',
  gap: 10,
  alignItems: 'stretch',
  [`@media (max-width: ${theme.breakpoints.mobile})`]: {
    flexDirection: 'column',
  },
}));

const JoinButton = styled(Button)({
  flexShrink: 0,
});

const RecentList = styled.ul({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

const RecentItem = styled.li(({ theme }) => ({
  position: 'relative',
  background: theme.colors.glassBg,
  border: `1px solid ${theme.colors.glassBorder}`,
  borderRadius: theme.radii.md,
  transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
  boxShadow: `inset 0 1px 0 ${theme.colors.glassHighlight}`,
  '&:hover': {
    borderColor: theme.colors.borderStrong,
    background: theme.colors.glassBgStrong,
    boxShadow: `
      inset 0 1px 0 ${theme.colors.glassHighlight},
      0 0 20px ${theme.colors.cyanSoft}
    `,
  },
}));

const RecentMain = styled.button(({ theme }) => ({
  width: '100%',
  background: 'transparent',
  border: 'none',
  padding: '12px 48px 12px 16px',
  textAlign: 'left',
  cursor: 'pointer',
  color: theme.colors.text,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  borderRadius: 'inherit',
  '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
}));

const RecentId = styled.span(({ theme }) => ({
  fontFamily: theme.fonts.mono,
  fontSize: 14,
  color: theme.colors.cyan,
  letterSpacing: '0.04em',
}));

const RecentTime = styled.span(({ theme }) => ({
  fontSize: 12,
  color: theme.colors.textFaint,
}));

const RecentRemove = styled.button(({ theme }) => ({
  position: 'absolute',
  right: 8,
  top: '50%',
  transform: 'translateY(-50%)',
  width: 28,
  height: 28,
  borderRadius: '50%',
  background: 'transparent',
  border: 'none',
  color: theme.colors.textFaint,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 16,
  lineHeight: 1,
  transition: 'background 0.15s, color 0.15s',
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
          <Logo id="lobby-title">P2P Chat</Logo>
          <Tagline>Прямое соединение. Без посредников.</Tagline>
          <BadgeRow>
            <Badge tone="success">WebRTC ready</Badge>
            <Badge tone="cyan">Signaling online</Badge>
            <Badge tone="violet">P2P</Badge>
          </BadgeRow>
        </Header>

        <Section aria-labelledby="profile-title">
          <SectionTitle id="profile-title">Профиль</SectionTitle>
          <ProfilePreview>
            <ProfileAvatar glowColor={`${color.value}55`} aria-hidden="true">
              {avatar.emoji}
            </ProfileAvatar>
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

        <Section>
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
              size="lg"
              value={roomIdInput}
              onChange={(v) => {
                setRoomIdInput(v);
                if (roomIdError) setRoomIdError(null);
              }}
              placeholder="например, k7m2pz"
              maxLength={12}
              error={roomIdError}
            />
            <JoinButton
              type="submit"
              variant="secondary"
              size="lg"
              disabled={!profile.isValid}
            >
              Войти
            </JoinButton>
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
