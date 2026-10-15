import { Bot } from '@app/game/bots/bot';
import { getPlayersHeldChips } from '@app/game/instance/utils';
import { Lobby } from '@app/game/lobby/lobby';
import { ChipsHeld } from '@app/game/types';

export class RiskyBot implements Bot {
  public id: string;
  public data: {
    lobby: Lobby;
    color: string;
    userName: string;
    isHost: boolean;
    isBot: boolean;
  };
  constructor({
    id,
    data,
  }: {
    id: string;
    data: {
      lobby: Lobby;
      color: string;
      userName?: string;
      isHost: boolean;
      isBot: boolean;
    };
  }) {
    this.id = id;
    this.data = {
      ...data,
      userName: 'Risky',
    };
  }

  shouldPassTurn(chipsHeld: ChipsHeld) {
    const currentPlayersHeldChips = getPlayersHeldChips(chipsHeld, this.id);

    // No matter what the circumstance, we want to hold more than 3 chips
    return currentPlayersHeldChips.length > 3;
  }
}
