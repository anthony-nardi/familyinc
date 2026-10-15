import { createContext, Dispatch, SetStateAction } from 'react';
import { ServerPayloads } from '@familyinc/shared/server/ServerPayloads';
import { ServerEvents } from '@familyinc/shared/server/ServerEvents';

export type LobbyState = ServerPayloads[ServerEvents.LobbyState] | null;

export type SocketState = {
  connected: boolean;
};

export type AppState = {
  lobbyState: LobbyState;
  setLobbyState: Dispatch<SetStateAction<LobbyState>>;
  socketState: SocketState;
  setSocketState: Dispatch<SetStateAction<SocketState>>;
};

export const AppStateContext = createContext<AppState | null>(null);
