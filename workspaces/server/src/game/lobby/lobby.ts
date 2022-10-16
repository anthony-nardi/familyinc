import { v4 } from 'uuid';
import { Server, Socket } from 'socket.io';
import { ServerEvents } from '@shared/server/ServerEvents';
import { AuthenticatedSocket } from '@app/game/types';
import { Instance } from '@app/game/instance/instance';
import { ServerPayloads, Color, colorMap } from '@shared/server/ServerPayloads';


export class Lobby {
  public readonly id: string = v4();

  public readonly createdAt: Date = new Date();

  public readonly clients: Map<Socket['id'], AuthenticatedSocket> = new Map<Socket['id'], AuthenticatedSocket>();

  public readonly instance: Instance = new Instance(this);

  constructor(
    private readonly server: Server,
    public logger: any,
    public readonly maxClients: number = 7,
  ) {
  }

  public addClient(client: AuthenticatedSocket, userName: string): void {

    this.logger.log('Adding client')

    this.clients.set(client.id, client);
    client.join(this.id);
    client.data.lobby = this;
    client.data.color = colorMap[this.clients.size];
    client.data.userName = userName
    // Someone needs to be lobby host. We also need to handle the host leaving and promoting another client to host.

    // Host is the person who can start the game.

    if (this.clients.size === 1) {
      client.data.isHost = true
      this.instance.setHostId(client.id)
      this.logger.log(`Is most recently added client the host:`, client.data.isHost)

    } else {
      client.data.isHost = false
      this.logger.log(`Is most recently added client the host:`, client.data.isHost)

    }

    this.logger.log(`Total clients: ${this.clients.size}`)

    if (this.clients.size >= this.maxClients) {

      this.instance.triggerStart(this.clients);
    }

    this.dispatchLobbyState();
  }

  public startGame(client: AuthenticatedSocket): void {
    this.instance.triggerStart(this.clients);
    this.dispatchLobbyState();
  }

  public drawChip(client: AuthenticatedSocket): void {
    this.instance.drawChip(client)
    this.dispatchLobbyState()
  }

  public passTurn(client: AuthenticatedSocket): void {
    this.instance.passTurn(client)
    this.dispatchLobbyState()
  }

  public removeClient(client: AuthenticatedSocket): void {
    this.clients.delete(client.id);
    client.leave(this.id);
    client.data.lobby = null;

    if (this.clients.size <= 1) {
      console.log('client size is now <= 1')

      // If player leave then the game isn't worth to play anymore
      this.instance.triggerFinish();
    } else if (client.data.isHost && this.clients.size > 1) {
      const nextClientId: Socket['id'] = this.clients.keys().next().value
      const clientToPromote = this.clients.get(nextClientId)
      console.log('Promoting another player to be host', nextClientId)
      if (clientToPromote) {
        clientToPromote.data.isHost = true
        this.instance.setHostId(nextClientId)

      }
    }

    // Alert the remaining player that client left lobby
    this.dispatchToLobby<ServerPayloads[ServerEvents.GameMessage]>(ServerEvents.GameMessage, {
      color: client.data.color,
      message: 'Opponent left lobby',
    });

    this.dispatchLobbyState();
  }

  public dispatchLobbyState(): void {

    let clients = {}

    this.clients.forEach(client => {
      clients[client.id] = {
        color: client.data.color,
        userName: client.data.userName,
        isHost: client.data.isHost,
      }
    })

    const chipsHeldAsObject = {}

    this.instance.chipsHeld.forEach((chipValueMap, clientId) => {
      chipsHeldAsObject[clientId] = Object.fromEntries(chipValueMap)
    })

    const payload: ServerPayloads[ServerEvents.LobbyState] = {
      lobbyId: this.id,
      delayBetweenRounds: this.instance.delayBetweenRounds,
      hasStarted: this.instance.hasStarted,
      hasFinished: this.instance.hasFinished,
      currentRound: this.instance.currentRound,
      playersCount: this.clients.size,
      isSuspended: this.instance.isSuspended,
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