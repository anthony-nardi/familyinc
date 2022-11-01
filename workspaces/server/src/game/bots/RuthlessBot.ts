import { Bot } from '@app/game/bots/bot'
import { isPlayerHoldingMoreThan2Chips } from '@app/game/instance/utils'
import { Lobby } from '@app/game/lobby/lobby';

export class RuthlessBot implements Bot {
  public id: string;
  public data: {
    lobby: Lobby;
    color: string;
    userName: string;
    isHost: boolean;
    isBot: boolean;
  }
  constructor({
    id,
    data
  }: {
    id: string;
    data: {
      lobby: Lobby;
      color: string;
      userName?: string;
      isHost: boolean;
      isBot: boolean;
    }
  }) {
    this.id = id;
    this.data = {
      ...data,
      userName: 'Ruthless'
    }
  }

  shouldPassTurn(chipsHeld) {
    const playChipsHeld = chipsHeld.get(this.id)
    return isPlayerHoldingMoreThan2Chips(playChipsHeld)
  }
}