import { useContext } from 'react';

import { SocketManagerContext } from '@components/websocket/SocketManagerProvider';
import useAppState from '@hooks/useAppState';

export default function useSocketManager() {
  const sm = useContext(SocketManagerContext);
  const { socketState } = useAppState();

  return { sm, socket: socketState };
}
