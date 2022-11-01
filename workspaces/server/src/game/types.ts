import { Socket } from 'socket.io';
import { Lobby } from '@app/game/lobby/lobby';
import { ServerEvents } from '@shared/server/ServerEvents';
import { Color } from '@shared/server/ServerPayloads';
import {ChipValues} from '@familyinc/shared/common/GameState'

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

export type ChipsHeld = Map<Socket['id'], Map<ChipValues, number>>
export type DiamondsHeld = Map<Socket['id'], number>
export type Scores = Map<Socket['id'], number>