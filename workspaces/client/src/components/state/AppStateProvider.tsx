import React, { useMemo, useState } from 'react';
import {
  AppStateContext,
  LobbyState,
  SocketState,
} from '@components/state/AppStateContext';

/**
 * Holds the two pieces of client-wide state: the lobby snapshot pushed by the
 * server and whether the socket is connected. (Replaces the former Recoil atoms.)
 */
export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [lobbyState, setLobbyState] = useState<LobbyState>(null);
  const [socketState, setSocketState] = useState<SocketState>({
    connected: false,
  });

  const value = useMemo(
    () => ({ lobbyState, setLobbyState, socketState, setSocketState }),
    [lobbyState, socketState],
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}
