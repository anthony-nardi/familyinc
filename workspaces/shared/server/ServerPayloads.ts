import { ServerEvents } from './ServerEvents';

export type Color = null | 'green' | 'red' | 'blue' | 'orange' | 'purple' | 'yellow' | 'brown';

export const colorMap = {
  1: 'green',
  2: 'red',3: 'blue',4:'orange',5:'purple',6:'yellow',7:'brown'
}

export type ServerPayloads = {
  [ServerEvents.LobbyState]: {
    lobbyId: string;
    delayBetweenRounds: number;
    hasStarted: boolean;
    hasFinished: boolean;
    currentRound: number;
    playersCount: number;
    isSuspended: boolean;
    scores: Record<string, number>;
    hostId: string;
    clients: Record<string, {[key: string]: any}>;
    currentPlayer: string | undefined;
    chipsHeld: any;
    diamondsHeld: any
  };

  [ServerEvents.GameMessage]: {
    message: string;
    color: Color
  };
};