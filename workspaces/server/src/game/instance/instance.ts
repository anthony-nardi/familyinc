import { Lobby } from '@app/game/lobby/lobby';
import { ServerException } from '@app/game/server.exception';
import { SocketExceptions } from '@shared/server/SocketExceptions';
import { AuthenticatedSocket } from '@app/game/types';
import { SECOND } from '@app/game/constants';
import { Socket } from 'socket.io';
import { ServerPayloads } from '@shared/server/ServerPayloads';
import { ServerEvents } from '@shared/server/ServerEvents';
import { getInitialChips } from '@app/game/instance/utils';
const getRandomItemFromMap = (iterable) => iterable.get([...iterable.keys()][Math.floor(Math.random() * iterable.size)])
const getRandomItemFromArray = (items) => items[Math.floor(Math.random() * items.length)];

type ChipValues = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10'

export class Instance {
  public hasStarted: boolean = false;

  public hasFinished: boolean = false;

  public isSuspended: boolean = false;

  public currentRound: number = 1;

  public hostId: string;

  public scores: Map<Socket['id'], number> = new Map();
  public chipsHeld: Map<Socket['id'], Map<ChipValues, number>> = new Map()
  public diamondsHeld: Map<Socket['id'], number> = new Map()

  public currentPlayer: string

  public turnOrder: string[]

  public chips = getInitialChips()

  public winner: string | null = null;

  constructor(
    private readonly lobby: Lobby,
  ) {
  }

  private isPlayerHoldingMoreThan2Chips(chipsHeld: Map<ChipValues, number> | undefined) {
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

  private getInitialPlayerHeldChips() {
    return new Map(
      Object.entries({
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0,
        '6': 0,
        '7': 0,
        '8': 0,
        '9': 0,
        '10': 0
      })
    ) as Map<ChipValues, number>
  }

  private getRandomClient(): AuthenticatedSocket {
    return getRandomItemFromMap(this.lobby.clients)
  }

  private initializeGame(clients: Map<Socket['id'], AuthenticatedSocket>): void {
    const clientIds = Array.from(clients.keys());

    this.hasStarted = true;
    this.currentPlayer = this.getRandomClient().id
    this.turnOrder = clientIds

    console.log(`turn order: ${this.turnOrder}`)

    clientIds.forEach(clientId => {
      this.scores.set(clientId, 0)
      this.diamondsHeld.set(clientId, 0)
      const newSetOfChips = this.getInitialPlayerHeldChips()
      this.chipsHeld.set(clientId, newSetOfChips)
    })

  }

  private stealChips() {
    this.chipsHeld.forEach((playerChips, clientId) => {
      if (clientId !== this.currentPlayer) {
        playerChips.forEach((amount, chipValue) => {
          console.log(`Player has ${amount} of ${chipValue} chips.`)

          const currentPlayersChipCountForChipValue = this.chipsHeld.get(this.currentPlayer)?.get(chipValue)

          console.log(`currentPlayersChipCountForChipValue: ${currentPlayersChipCountForChipValue}`)
          if (currentPlayersChipCountForChipValue) {
            this.chipsHeld.get(this.currentPlayer)?.set(chipValue, currentPlayersChipCountForChipValue + amount)
            this.chipsHeld.get(clientId)?.set(chipValue, 0)
          }
        })
      }
    })
  }

  public setHostId(hostId: Socket['id']): void {
    this.hostId = hostId
  }

  public triggerStart(clients: Map<Socket['id'], AuthenticatedSocket>): void {
    if (this.hasStarted) {
      return;
    }
    // Start game, set current player, determine player order, init game state
    this.initializeGame(clients)
    this.lobby.dispatchLobbyState();

    this.lobby.dispatchToLobby<ServerPayloads[ServerEvents.GameMessage]>(ServerEvents.GameMessage, {
      color: 'blue',
      message: 'Game started!',
    });
  }

  public triggerFinish(): void {
    if (this.hasFinished || !this.hasStarted) {
      return;
    }

    this.hasFinished = true;

    this.lobby.dispatchToLobby<ServerPayloads[ServerEvents.GameMessage]>(ServerEvents.GameMessage, {
      color: 'blue',
      message: 'Game finished !',
    });
  }

  public drawChip(client: AuthenticatedSocket) {
    const clientId = client.id
    const chipDrawn: ChipValues = getRandomItemFromArray(this.chips)

    console.log(`Chip Drawn: ${chipDrawn}`)

    this.chips.splice(this.chips.indexOf(chipDrawn), 1)

    console.log(`Chips left: ${this.chips.length}`)

    if (this.chips.length === 0) {
      this.chips = getInitialChips()
      console.log('we actually ran out of chips..')
    }

    const playChipsHeld = this.chipsHeld.get(clientId)

    const currentNumberOfHeldChipsByType = playChipsHeld?.get(chipDrawn) || 0

    if (currentNumberOfHeldChipsByType === 0) {
      playChipsHeld?.set(chipDrawn, 1)
    } else {
      // loses currently held chips
      this.chipsHeld.set(clientId, this.getInitialPlayerHeldChips())

      const hasBustedWithoutReceivingDiamond = this.isPlayerHoldingMoreThan2Chips(playChipsHeld)
      if (hasBustedWithoutReceivingDiamond) {
        console.log('hasBustedWithoutReceivingDiamond')
        // more than 3 chips - just pass turn
        this.passTurn(client)
        return;
      } else {
        console.log('Less than 3 chips currently held...')
        // less than 3 chips - receive diamond or score 50
        const currentDiamondsHeld = this.diamondsHeld.get(clientId) || 0
        const nextDiamondsHeld = currentDiamondsHeld + 1
        this.diamondsHeld.set(clientId, nextDiamondsHeld)

        if (nextDiamondsHeld < 3) {
          this.passTurn(client)
        }

        if (nextDiamondsHeld === 3) {
          console.log('Player has 3 diamonds!')
          this.diamondsHeld.set(clientId, 0)
          const currentPlayerScore = this.scores.get(clientId) || 0
          const nextScore = currentPlayerScore + 50;
          this.scores.set(clientId, nextScore);

          if (nextScore >= 100) {
            console.log('Win')
            // handle winner
            this.winner = clientId
            this.hasFinished = true
          } else {
            console.log('Pass turn')
            // game continues
            this.passTurn(client)
          }
        } 
      }
    }

    this.lobby.dispatchLobbyState();

    return chipDrawn
  }

  public passTurn(client: AuthenticatedSocket) {
 
    // before the turn is passed
    if (this.chipsHeld.get(client.id)) {
      console.log('steal other chips of same value')
      this.stealChips()
    }


    // pass turn to next player
    const currentTurnIndex = this.turnOrder.indexOf(this.currentPlayer)
    const nextIndex = this.turnOrder.length === currentTurnIndex + 1 ? 0 : currentTurnIndex + 1
    this.currentPlayer = this.turnOrder[nextIndex]

    // score for the current player
    this.scoreForCurrentPlayer()

    if ((this.scores.get(this.currentPlayer) || 0) >= 100) {
      this.winner = this.currentPlayer
      this.triggerFinish()
      return
    }

    // no winner - clear chips
    this.chipsHeld.set(this.currentPlayer, this.getInitialPlayerHeldChips())

    this.lobby.dispatchLobbyState();
  }

  private scoreForCurrentPlayer() {
    let scoreToAdd = 0
    const currentScore = this.scores.get(this.currentPlayer) || 0
    const currentChipsHeld = this.chipsHeld.get(this.currentPlayer)

    if (currentChipsHeld) {
      currentChipsHeld.forEach((amount, chipValue) => {
        scoreToAdd += Number(amount) * Number(chipValue)
      })
    }

    this.scores.set(this.currentPlayer, currentScore + scoreToAdd)
  }

}