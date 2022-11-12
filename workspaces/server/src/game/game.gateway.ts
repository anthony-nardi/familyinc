import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsResponse,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ClientEvents } from '@shared/client/ClientEvents';
import { ServerEvents } from '@shared/server/ServerEvents';
import { LobbyManager } from '@app/game/lobby/lobby.manager';
import { Logger, UsePipes } from '@nestjs/common';
import { AuthenticatedSocket } from '@app/game/types';
import { ServerException } from '@app/game/server.exception';
import { SocketExceptions } from '@shared/server/SocketExceptions';
import { ServerPayloads } from '@shared/server/ServerPayloads';
import { LobbyCreateDto, LobbyJoinDto, } from '@app/game/dtos';
import { WsValidationPipe } from '@app/websocket/ws.validation-pipe';
import { SimpleBot } from '@app/game/bots/SimpleBot';
import { CarefulBot } from '@app/game/bots/CarefulBot';
import { RiskyBot } from '@app/game/bots/RiskyBot';
import { RuthlessBot } from '@app/game/bots/RuthlessBot';
import { StealyBot } from '@app/game/bots/StealyBot';
import { RandomBot } from '@app/game/bots/RandomBot';

const botGenerationOrder = [
  SimpleBot,
  CarefulBot,
  RiskyBot,
  RuthlessBot,
  StealyBot,
  RandomBot
]


@UsePipes(new WsValidationPipe())
@WebSocketGateway()
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger: Logger = new Logger(GameGateway.name);

  constructor(
    private readonly lobbyManager: LobbyManager,
  ) {
  }

  private isHost(client: AuthenticatedSocket): boolean {
    return client.data.isHost && client.id === client.data.lobby?.instance.hostId
  }

  afterInit(server: Server): any {
    // Pass server instance to managers
    this.lobbyManager.server = server;
    this.lobbyManager.logger = this.logger
  }

  async handleConnection(client: Socket, ...args: any[]): Promise<void> {
    // Call initializers to set up socket
    this.lobbyManager.initializeSocket(client as AuthenticatedSocket);
  }

  async handleDisconnect(client: AuthenticatedSocket): Promise<void> {
    // Handle termination of socket
    this.lobbyManager.terminateSocket(client);
  }

  @SubscribeMessage(ClientEvents.Ping)
  onPing(client: AuthenticatedSocket): void {
    client.emit(ServerEvents.Pong, {
      message: 'pong',
    });
  }

  @SubscribeMessage(ClientEvents.LobbyCreate)
  onLobbyCreate(client: AuthenticatedSocket, data: LobbyCreateDto): WsResponse<ServerPayloads[ServerEvents.GameMessage]> {
    const lobby = this.lobbyManager.createLobby();
    lobby.addClient(client, data.userName);

    return {
      event: ServerEvents.GameMessage,
      data: {
        color: 'green',
        message: 'Lobby created.',
      },
    };
  }

  @SubscribeMessage(ClientEvents.LobbyJoin)
  onLobbyJoin(client: AuthenticatedSocket, data: LobbyJoinDto): void {
    this.lobbyManager.joinLobby(data.lobbyId, client, data.userName);
  }

  @SubscribeMessage(ClientEvents.LobbyLeave)
  onLobbyLeave(client: AuthenticatedSocket): void {
    client.data.lobby?.removeClient(client);
  }

  @SubscribeMessage(ClientEvents.StartGame)
  onStartGame(client: AuthenticatedSocket, data: { bots: number }): void {
    const lobby = client.data.lobby
    if (!lobby) {
      throw new ServerException(SocketExceptions.LobbyError, 'You are not in a lobby');
    }
    if (!this.isHost(client)) {
      throw new ServerException(SocketExceptions.GameError, 'Only the host can start the game.')
    }
    if (lobby.clients.size <= 1 && !data.bots) {
      throw new ServerException(SocketExceptions.GameError, 'The game needs more than 1 player to start.')
    }

    if (data.bots) {
      for (let i = 0; i < data.bots; i++) {
        const BotType = botGenerationOrder[i]
        const bot = new BotType({
          id: `bot_${i}`,
          data: {
            lobby,
            color: 'red',
            isHost: false,
            isBot: true
          }
        })

        this.lobbyManager.joinLobby(lobby.id, bot, bot.data.userName);

      }
    }

    lobby.instance.triggerStart(lobby.clients)
  }

  @SubscribeMessage(ClientEvents.DrawChip)
  onDrawChip(client: AuthenticatedSocket): void {
    const lobby = client.data.lobby
    if (!lobby) {
      throw new ServerException(SocketExceptions.LobbyError, 'You are not in a lobby');
    }

    if (client.id !== lobby.instance.currentPlayer) {
      throw new ServerException(SocketExceptions.GameError, 'Only the current player may draw a chip.')
    }

    lobby.instance.drawChip(client)
  }

  @SubscribeMessage(ClientEvents.PassTurn)
  onPassTurn(client: AuthenticatedSocket): void {
    const lobby = client.data.lobby
    if (!lobby) {
      throw new ServerException(SocketExceptions.LobbyError, 'You are not in a lobby');
    }
    if (client.id !== lobby.instance.currentPlayer) {
      throw new ServerException(SocketExceptions.GameError, 'Only the current player may pass the turn.')
    }
    lobby.instance.passTurn(client)
  }
}