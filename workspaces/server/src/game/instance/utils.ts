import { AuthenticatedSocket, ChipValues, ChipsHeld } from '@app/game/types';


export const getInitialChips = () => {
  return [
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "2",
    "2",
    "2",
    "2",
    "2",
    "2",
    "2",
    "2",
    "2",
    "2",
    "2",
    "2",
    "2",
    "2",
    "2",
    "2",
    "3",
    "3",
    "3",
    "3",
    "3",
    "3",
    "3",
    "3",
    "3",
    "3",
    "3",
    "3",
    "3",
    "3",
    "3",
    "3",
    "4",
    "4",
    "4",
    "4",
    "4",
    "4",
    "4",
    "4",
    "4",
    "4",
    "4",
    "4",
    "4",
    "4",
    "4",
    "4",
    "5",
    "5",
    "5",
    "5",
    "5",
    "5",
    "5",
    "5",
    "5",
    "5",
    "5",
    "5",
    "5",
    "5",
    "5",
    "5",
    "6",
    "6",
    "6",
    "6",
    "6",
    "6",
    "6",
    "6",
    "6",
    "6",
    "6",
    "7",
    "7",
    "7",
    "7",
    "7",
    "7",
    "7",
    "7",
    "7",
    "7",
    "7",
    "8",
    "8",
    "8",
    "8",
    "8",
    "8",
    "8",
    "8",
    "8",
    "8",
    "8",
    "9",
    "9",
    "9",
    "9",
    "9",
    "9",
    "9",
    "9",
    "9",
    "9",
    "9",
    "10",
    "10",
    "10",
    "10",
    "10",
    "10",
    "10",
    "10",
    "10",
    "10",
    "10"
  ]
}

export function isPlayerHoldingMoreThan2Chips(chipsHeld: Map<ChipValues, number> | undefined) {
  let amountHeld = 0

  if (!chipsHeld) {
    return false
  }

  chipsHeld.forEach(chips => {
    if (typeof chips === 'number' && chips > 0) {
      amountHeld++
    }
  })

  return amountHeld >= 3
}


export function getPlayersHeldChips(chipsHeld: ChipsHeld, clientId: string) {
  const playerHeldChips: string[] = []

  chipsHeld.get(clientId)?.forEach((count, chipValue: ChipValues) => {
    if (count) {
      playerHeldChips.push(chipValue)
    }
  })

  return playerHeldChips
}