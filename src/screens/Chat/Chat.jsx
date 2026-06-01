import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { Button } from '../../components/Button';

const Wrapper = styled.div({
  minHeight: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
});

const Card = styled.section(({ theme }) => ({
  maxWidth: 480,
  width: '100%',
  background: theme.colors.bg1,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radii.lg,
  padding: 28,
  textAlign: 'center',
}));

const Heading = styled.h1({
  fontSize: 20,
  margin: '0 0 20px',
});

export function Chat() {
  const navigate = useNavigate();
  const { roomId } = useParams();

  return (
    <Wrapper>
      <Card>
        <Heading>Чат — {roomId}</Heading>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Выйти в лобби
        </Button>
      </Card>
    </Wrapper>
  );
}
