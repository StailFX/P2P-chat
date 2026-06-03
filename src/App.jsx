import { Navigate, Route, Routes } from 'react-router-dom';
import { Lobby } from './screens/Lobby/Lobby';
import { Chat } from './screens/Chat/Chat';
import { Files } from './screens/Files/Files';
import { RoomLayout } from './screens/RoomLayout';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Lobby />} />
      <Route path="/room/:roomId" element={<RoomLayout />}>
        <Route index element={<Navigate to="chat" replace />} />
        <Route path="chat" element={<Chat />} />
        <Route path="files" element={<Files />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
