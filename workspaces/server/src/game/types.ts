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

export type ChipValues = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10'

export type ChipsHeld = Map<Socket['id'], Map<ChipValues, number>>
export type DiamondsHeld = Map<Socket['id'], number>
export type Scores = Map<Socket['id'], number>