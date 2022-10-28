import { Bot } from '@app/game/bots/bot'
import { isPlayerHoldingMoreThan2Chips,getPlayersHeldChips } from '@app/game/instance/utils'
import { Lobby } from '@app/game/lobby/lobby';
import { ChipsHeld, ChipValues } from '@app/game/types'

export class StealyBot implements Bot {
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
      userName: 'Stealy'
    }
  }

  shouldPassTurn(chipsHeld: ChipsHeld) {
    let shouldPass = false;
    let willSteal = false;
    let canSteal = false;

    const currentPlayersHeldChips = getPlayersHeldChips(chipsHeld, this.id)


    chipsHeld.forEach((values, clientId) => {
      if (clientId !== this.id) {
        for (let i = 0; i < currentPlayersHeldChips.length; i++) {
          const chipValue: ChipValues = currentPlayersHeldChips[i] as ChipValues
          if (values.get(chipValue)) {
            willSteal = true;
          } 
        }
      }
    })

    // Holding some chips and we cant steal
    if (currentPlayersHeldChips.length >= 5 && !willSteal && !canSteal) {
      return true;
    }

    if (willSteal || canSteal) {
      shouldPass = true
    }

    return shouldPass
  }
}