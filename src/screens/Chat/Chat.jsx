import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { Button } from '../../components/Button';

const Wrapper = styled.div({
  position: 'relative',
  zIndex: 1,
  minHeight: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
});

const Card = styled.section(({ theme }) => ({
  position: 'relative',
  maxWidth: 480,
  width: '100%',
  background: theme.colors.glassBg,
  backdropFilter: theme.blurs.glass,
  WebkitBackdropFilter: theme.blurs.glass,
  border: `1px solid ${theme.colors.glassBorder}`,
  borderRadius: theme.radii.xl,
  padding: 32,
  textAlign: 'center',
  boxShadow: `
    inset 0 1px 0 ${theme.colors.glassHighlight},
    0 24px 64px rgba(0,0,0,0.5)
  `,
}));

const Heading = styled.h1(({ theme }) => ({
  fontSize: 22,
  margin: '0 0 8px',
  fontWeight: 700,
  letterSpacing: '-0.01em',
}));

const RoomId = styled.span(({ theme }) => ({
  fontFamily: theme.fonts.mono,
  color: theme.colors.cyan,
  fontWeight: 600,
}));

const Hint = styled.p(({ theme }) => ({
  margin: '0 0 24px',
  color: theme.colors.textMuted,
  fontSize: 13,
}));

export function Chat() {
  const navigate = useNavigate();
  const { roomId } = useParams();

  return (
    <Wrapper>
      <Card>
        <Heading>
          Чат — <RoomId>{roomId}</RoomId>
        </Heading>
        <Hint>Подключение установлено. Можно общаться.</Hint>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Выйти в лобби
        </Button>
      </Card>
    </Wrapper>
  );
}
