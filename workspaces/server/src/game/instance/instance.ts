import { Lobby } from '@app/game/lobby/lobby';
import { AuthenticatedSocket } from '@app/game/types';
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

    clientIds.forEach(clientId => {
      this.scores.set(clientId, 0)
      this.diamondsHeld.set(clientId, 0)
      const newSetOfChips = this.getInitialPlayerHeldChips()
      this.chipsHeld.set(clientId, newSetOfChips)
    })

    // this.lobby.logger.log(JSON.stringify(clients.get(this.currentPlayer)))
    // this.lobby.logger.log(clients.get(this.currentPlayer))

    const currentPlayerClient = clients.get(this.currentPlayer)
    if (currentPlayerClient && currentPlayerClient.data.isBot) {
      this.makeBotTurn(currentPlayerClient)
    }

  }

  private makeBotTurn(client: AuthenticatedSocket) {
    const playChipsHeld = this.chipsHeld.get(client.id)
    if (this.isPlayerHoldingMoreThan2Chips(playChipsHeld)) {
      this.passTurn(client)
    } else {
      this.drawChip(client)
    }

    if (this.currentPlayer === client.id && !this.hasFinished) {
      setTimeout(() => {
        this.makeBotTurn(client)
      }, 2500)
    }
  }

  private stealChips() {
    const currentPlayersHeldChips = this.chipsHeld.get(this.currentPlayer)

    if (!currentPlayersHeldChips) {
      return;
    }

    this.chipsHeld.forEach((playerChips, clientId) => {
      if (clientId !== this.currentPlayer) {
        playerChips.forEach((amount, chipValue) => {
          const currentPlayersChipCountForChipValue = currentPlayersHeldChips.get(chipValue)
          if (currentPlayersChipCountForChipValue) {
            currentPlayersHeldChips.set(chipValue, currentPlayersChipCountForChipValue + amount)
            playerChips.set(chipValue, 0)
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
      message: 'Game finished!',
    });
  }

  public drawChip(client: AuthenticatedSocket) {
    const clientId = client.id
    const chipDrawn: ChipValues = getRandomItemFromArray(this.chips)

    this.chips.splice(this.chips.indexOf(chipDrawn), 1)

    if (this.chips.length === 0) {
      this.chips = this.resetChipsAvailable()
    }

    const playChipsHeld = this.chipsHeld.get(clientId)

    const currentNumberOfHeldChipsByType = playChipsHeld?.get(chipDrawn)

    if (currentNumberOfHeldChipsByType === 0) {
      playChipsHeld?.set(chipDrawn, 1)
    } else {
      // loses currently held chips
      this.chipsHeld.set(clientId, this.getInitialPlayerHeldChips())

      const hasBustedWithoutReceivingDiamond = this.isPlayerHoldingMoreThan2Chips(playChipsHeld)

      if (hasBustedWithoutReceivingDiamond) {
        // more than 3 chips - just pass turn
        this.passTurn(client)
      } else {
        // less than 3 chips - receive diamond or score 50
        const currentDiamondsHeld = this.diamondsHeld.get(clientId) || 0
        const nextDiamondsHeld = currentDiamondsHeld + 1
        this.diamondsHeld.set(clientId, nextDiamondsHeld)

        if (nextDiamondsHeld < 3) {
          this.passTurn(client)
        }

        if (nextDiamondsHeld === 3) {
          this.diamondsHeld.set(clientId, 0)
          const currentPlayerScore = this.scores.get(clientId) || 0
          const nextScore = currentPlayerScore + 50;
          this.scores.set(clientId, nextScore);

          if (nextScore >= 100) {
            this.winner = clientId
            this.triggerFinish()
          } else {
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
      this.stealChips()
    }

    // pass turn to next player
    const currentTurnIndex = this.turnOrder.indexOf(this.currentPlayer)
    const nextIndex = this.turnOrder.length === currentTurnIndex + 1 ? 0 : currentTurnIndex + 1
    this.currentPlayer = this.turnOrder[nextIndex]

    // score for the current player
    this.scoreForCurrentPlayer()

    this.chipsHeld.set(this.currentPlayer, this.getInitialPlayerHeldChips())

    if ((this.scores.get(this.currentPlayer) || 0) >= 100) {
      this.winner = this.currentPlayer
      this.triggerFinish()
    }


    const currentPlayerClient = this.lobby.clients.get(this.currentPlayer)
    if (currentPlayerClient && currentPlayerClient.data.isBot) {
      this.makeBotTurn(currentPlayerClient)
    }

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

  private getAllChipsInPlay() {
    const chipsInPlay: string[] = []
    const clientIds = Array.from(this.lobby.clients.keys());
    for (let i = 0; i < clientIds.length; i++) {
      const playerChips = this.chipsHeld.get(clientIds[i])
      for (let k = 1; k <= 10; k++) {
        const chipValue = `${k}` as ChipValues
        const chipsHeld = playerChips?.get(chipValue)
        if (chipsHeld) {
          for (let l = 0; l < chipsHeld; l++) {
            chipsInPlay.push(chipValue)

          }
        }
      }
    }
    return chipsInPlay
  }

  private resetChipsAvailable() {
    const chipsInPlay = this.getAllChipsInPlay()
    const initialChips = getInitialChips()

    for (let i = 0; i < chipsInPlay.length; i++) {
      initialChips.splice(initialChips.indexOf(chipsInPlay[i]), 1)

    }

    return initialChips
  }
}