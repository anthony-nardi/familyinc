import { Bot } from '@app/game/bots/bot'
import { isPlayerHoldingMoreThan2Chips,getPlayersHeldChips } from '@app/game/instance/utils'
import { Lobby } from '@app/game/lobby/lobby';
import { ChipsHeld,  } from '@app/game/types'
import {ChipValues} from '@familyinc/shared/common/GameState'

export class CarefulBot implements Bot {
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
      userName: 'Careful'
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
        if (!willSteal) {
          const otherPlayerChipsHeld = getPlayersHeldChips(chipsHeld, clientId)
          if (otherPlayerChipsHeld.length) {
            canSteal = true
          }
        }
      }
    })

    // Holding some chips and we cant steal

    if (!canSteal) {
      shouldPass = currentPlayersHeldChips.length >= 3;
    }

    if (canSteal && !willSteal) {
      shouldPass = currentPlayersHeldChips.length >= 3
    }

    if (willSteal) {
      shouldPass = true
    }

    return shouldPass
  }
}