import { atom } from 'recoil';
import { ServerPayloads } from '@familyinc/shared/server/ServerPayloads';
import { ServerEvents } from '@familyinc/shared/server/ServerEvents';

export const CurrentLobbyState = atom<ServerPayloads[ServerEvents.LobbyState] | null>({
  key: 'CurrentLobbyState',
  default: null,
});