import { Lobby } from '@app/game/lobby/lobby';
import { AuthenticatedSocket, ChipsHeld, DiamondsHeld, Scores } from '@app/game/types';
import { ChipValues } from '@familyinc/shared/common/GameState'
import { Socket } from 'socket.io';
import { ServerPayloads } from '@shared/server/ServerPayloads';
import { ServerEvents } from '@shared/server/ServerEvents';
import { getInitialChips, isPlayerHoldingMoreThan2Chips } from '@app/game/instance/utils';
import { Bot } from '@app/game/bots/Bot'

const getRandomItemFromMap = (iterable) => iterable.get([...iterable.keys()][Math.floor(Math.random() * iterable.size)])
const getRandomItemFromArray = (items) => items[Math.floor(Math.random() * items.length)];


export class Instance {
  public hasStarted: boolean = false;
  public hasFinished: boolean = false;
  public hostId: string;
  public scores: Scores = new Map();
  public chipsHeld: ChipsHeld = new Map()
  public diamondsHeld: DiamondsHeld = new Map()
  public currentPlayer: string
  public turnOrder: string[]
  public chips = getInitialChips()
  public winner: string | null = null;

  constructor(
    private readonly lobby: Lobby,
  ) {
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

  private initializeGame(clients: Map<Socket['id'], AuthenticatedSocket | Bot> | Map<Socket['id'], Bot>): void {
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

    const currentPlayerClient = clients.get(this.currentPlayer)
    if (currentPlayerClient && currentPlayerClient.data.isBot) {
      this.makeBotTurn(currentPlayerClient as Bot)
    }

  }

  private makeBotTurn(client: Bot) {

    const shouldBotPass = client.shouldPassTurn(this.chipsHeld, this.diamondsHeld, this.scores)

    if (shouldBotPass) {
      this.passTurn(client)
    } else {
      this.drawChip(client)
    }

    if (this.currentPlayer === client.id && !this.hasFinished) {
      setTimeout(() => {
        this.makeBotTurn(client)
      }, 2000)
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

  public triggerStart(clients: Map<Socket['id'], AuthenticatedSocket | Bot>): void {
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

  public drawChip(client: AuthenticatedSocket | Bot) {
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
      let hasBustedWithoutReceivingDiamond = false

      if (playChipsHeld) {
        hasBustedWithoutReceivingDiamond = isPlayerHoldingMoreThan2Chips(playChipsHeld)
      }


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

  public passTurn(client: AuthenticatedSocket | Bot) {

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
    if (currentPlayerClient && currentPlayerClient.data.isBot && !(currentPlayerClient instanceof Socket)) {
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