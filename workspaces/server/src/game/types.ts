import { Socket } from 'socket.io';
import { Lobby } from '@app/game/lobby/lobby';
import { ServerEvents } from '@shared/server/ServerEvents';
import { Color } from '@shared/server/ServerPayloads';

export type AuthenticatedSocket = Socket & {
  data: {
    lobby: null | Lobby;
    color: Color,
    userName: string,
    isHost: true | false,
    isBot: false | true
  };

  emit: <T>(ev: ServerEvents, data: T) => boolean;
};