import { AuthenticatedSocket } from '@app/game/types';
import { Lobby } from '@app/game/lobby/lobby';

export interface Bot {

   id: string
   data: {
    lobby: Lobby;
    color: string;
    isHost: boolean;
    isBot: boolean;
    userName?: string
  }

  shouldPassTurn: Function

}   