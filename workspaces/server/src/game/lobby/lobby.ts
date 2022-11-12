import { v4 } from 'uuid';
import { Server, Socket } from 'socket.io';
import { ServerEvents } from '@shared/server/ServerEvents';
import { AuthenticatedSocket } from '@app/game/types';
import { Instance } from '@app/game/instance/instance';
import { ServerPayloads, Color, colorMap } from '@shared/server/ServerPayloads';
import { Bot } from '@app/game/bots/bot';

export class Lobby {
  public readonly id: string = v4();
  public readonly createdAt: Date = new Date();
  public readonly clients: Map<Socket['id'], AuthenticatedSocket | Bot> = new Map<Socket['id'], AuthenticatedSocket>();
  public readonly instance: Instance = new Instance(this);

  constructor(
    private readonly server: Server,
    public logger: any,
    public readonly maxClients: number = 7,
  ) {
  }

  private replaceOldClientWithNew(client: AuthenticatedSocket | Bot, clientUUID: string) {
    // we must essentially add this new client and copy all existing state from the old client to this one...
    this.clients.forEach(maybeOldClient => {

      const doesOldClientInstanceExist = maybeOldClient.data.uuid === clientUUID

      if (doesOldClientInstanceExist) {
        const oldClientId = maybeOldClient.id
        // Copy old client data to new client data
        client.data = { ...maybeOldClient.data }

        // Delete old client
        this.clients.delete(maybeOldClient.id)
        // @ts-expect-error ignore
        maybeOldClient.leave(this.id)
        maybeOldClient.data.lobby = null

        // If game has started we need to:
        // (fix anything that ever included the client.id)
        // - Fix the turn order
        // - Fix the current player
        if (this.instance.hasStarted) {

          // Turn Order
          const leavingPlayerTurnOrderIndex = this.instance.turnOrder.indexOf(maybeOldClient.id)
          if (leavingPlayerTurnOrderIndex > -1) {
            this.instance.turnOrder[leavingPlayerTurnOrderIndex] = client.id
          }

          // Current Player
          if (this.instance.currentPlayer === maybeOldClient.id) {
            this.instance.currentPlayer = client.id
          }

        }

        // Host
        if (client.data.isHost) {
          this.instance.setHostId(client.id)
        }

        // Scores
        const scoresForOldClient = this.instance.scores.get(oldClientId)
        if (scoresForOldClient) {
          this.instance.scores.set(client.id, scoresForOldClient)
        }
        this.instance.scores.delete(oldClientId)

        // Chips Held
        const chipsForOldClient = this.instance.chipsHeld.get(oldClientId)
        if (chipsForOldClient) {
          this.instance.chipsHeld.set(client.id, chipsForOldClient)
        }
        this.instance.chipsHeld.delete(oldClientId)

        // Diamonds Held
        const diamondsForOldClient = this.instance.diamondsHeld.get(oldClientId)
        if (diamondsForOldClient) {
          this.instance.diamondsHeld.set(client.id, diamondsForOldClient)
        }
        this.instance.diamondsHeld.delete(oldClientId)

      }
    })
  }

  public addClient(client: AuthenticatedSocket | Bot, userName: string, clientUUID?: string): void {

    if (clientUUID) {
      this.replaceOldClientWithNew(client, clientUUID)
    }

    this.logger.log(`Setting ${client.id} client`)

    this.clients.set(client.id, client);

    if (client instanceof Socket) {
      client.join(this.id);
    }

    if (!client.data.lobby) {
      console.log('OK GOTTA SET UP DUDE')
      client.data.lobby = this;
      client.data.color = colorMap[this.clients.size];
      client.data.userName = userName
      client.data.uuid = v4()


      // Someone needs to be lobby host. We also need to handle the host leaving and promoting another client to host.
      // Host is the person who can start the game.
      if (this.clients.size === 1) {
        client.data.isHost = true
        this.instance.setHostId(client.id)
      } else {
        client.data.isHost = false
      }

    }



    const isLobbyFull = this.clients.size >= this.maxClients

    if (isLobbyFull && !this.instance.hasStarted) {
      this.instance.triggerStart(this.clients);
    }

    this.dispatchLobbyState();
  }

  public removeClient(client: AuthenticatedSocket): void {
    this.logger.log(`${client.id} disconnected.`)
    // this.clients.delete(client.id);
    // client.leave(this.id);
    // client.data.lobby = null;

    // const shouldEndGame = this.clients.size <= 1;

    // if (shouldEndGame) {
    //   this.instance.triggerFinish();
    // }

    // const shouldPromoteAnotherClientToHost = client.data.isHost && this.clients.size > 1

    // if (shouldPromoteAnotherClientToHost) {
    //   const nextClientId: Socket['id'] = this.clients.keys().next().value
    //   const clientToPromote = this.clients.get(nextClientId)
    //   if (clientToPromote) {
    //     clientToPromote.data.isHost = true
    //     this.instance.setHostId(nextClientId)
    //   }
    // }

    // // Fix turn order if game started. Pass turn if needed.
    // if (this.instance.hasStarted) {
    //   const leavingPlayerTurnOrderIndex = this.instance.turnOrder.indexOf(client.id)
    //   if (leavingPlayerTurnOrderIndex > -1) {
    //     this.instance.turnOrder.splice(leavingPlayerTurnOrderIndex, 1)
    //   }
    //   if (this.instance.currentPlayer === client.id) {
    //     this.instance.passTurn(client)
    //   }
    // }

    // this.dispatchToLobby<ServerPayloads[ServerEvents.GameMessage]>(ServerEvents.GameMessage, {
    //   color: client.data.color,
    //   message: 'Opponent left lobby',
    // });

    this.dispatchLobbyState();
  }

  public dispatchLobbyState(): void {

    let clients = {}

    this.clients.forEach(client => {
      clients[client.id] = {
        color: client.data.color,
        userName: client.data.userName,
        isHost: client.data.isHost,
        uuid: client.data.uuid
      }
    })

    const chipsHeldAsObject = {}

    this.instance.chipsHeld.forEach((chipValueMap, clientId) => {
      chipsHeldAsObject[clientId] = Object.fromEntries(chipValueMap)
    })

    const payload: ServerPayloads[ServerEvents.LobbyState] = {
      lobbyId: this.id,
      hasStarted: this.instance.hasStarted,
      hasFinished: this.instance.hasFinished,
      playersCount: this.clients.size,
      hostId: this.instance.hostId,
      clients,
      currentPlayer: this.instance.currentPlayer,
      scores: Object.fromEntries(this.instance.scores),
      chipsHeld: chipsHeldAsObject,
      diamondsHeld: Object.fromEntries(this.instance.diamondsHeld),
      winner: this.instance.winner
    };

    this.dispatchToLobby(ServerEvents.LobbyState, payload);
  }

  public dispatchToLobby<T>(event: ServerEvents, payload: T): void {
    this.server.to(this.id).emit(event, payload);
  }
}