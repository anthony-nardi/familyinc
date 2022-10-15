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
import { LobbyCreateDto, LobbyJoinDto,  } from '@app/game/dtos';
import { WsValidationPipe } from '@app/websocket/ws.validation-pipe';

@UsePipes(new WsValidationPipe())
@WebSocketGateway()
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger: Logger = new Logger(GameGateway.name);

  constructor(
    private readonly lobbyManager: LobbyManager,
  )
  {
  }

  afterInit(server: Server): any
  {
    // Pass server instance to managers
    this.lobbyManager.server = server;
    this.lobbyManager.logger = this.logger

    this.logger.log('Game server initialized !');
  }

  async handleConnection(client: Socket, ...args: any[]): Promise<void>
  {
    // Call initializers to set up socket
    this.lobbyManager.initializeSocket(client as AuthenticatedSocket);
  }

  async handleDisconnect(client: AuthenticatedSocket): Promise<void>
  {
    // Handle termination of socket
    this.lobbyManager.terminateSocket(client);
  }

  @SubscribeMessage(ClientEvents.Ping)
  onPing(client: AuthenticatedSocket): void
  {
    client.emit(ServerEvents.Pong, {
      message: 'pong',
    });
  }

  @SubscribeMessage(ClientEvents.LobbyCreate)
  onLobbyCreate(client: AuthenticatedSocket, data: LobbyCreateDto): WsResponse<ServerPayloads[ServerEvents.GameMessage]>
  {
    const lobby = this.lobbyManager.createLobby(data.delayBetweenRounds);
    lobby.addClient(client, data.userName);
    this.logger.log(`Client added:`, JSON.stringify({isHost: client.data.isHost, color: client.data.color}))
    this.logger.log(`Total clients in lobby: ${lobby.clients.size}`)
    
    return {
      event: ServerEvents.GameMessage,
      data: {
        color: 'green',
        message: 'Lobby created',
      },
    };
  }

  @SubscribeMessage(ClientEvents.StartGame)
  onStartGame(client: AuthenticatedSocket): void
{
  this.logger.log('Starting game request')
  this.lobbyManager.startGame(client)
}

@SubscribeMessage(ClientEvents.DrawChip)
onDrawChip(client: AuthenticatedSocket): void 
{
  this.logger.log('draw chip')
  this.lobbyManager.drawChip(client)
}

@SubscribeMessage(ClientEvents.PassTurn)
onPassTurn(client: AuthenticatedSocket): void
{
  this.logger.log('pass turn')
  this.lobbyManager.passTurn(client)
}

  @SubscribeMessage(ClientEvents.LobbyJoin)
  onLobbyJoin(client: AuthenticatedSocket, data: LobbyJoinDto): void
  {
    this.logger.log(`New client joining lobby: ${data.lobbyId} ${data.userName}`)
    this.lobbyManager.joinLobby(data.lobbyId, client, data.userName);
  }

  @SubscribeMessage(ClientEvents.LobbyLeave)
  onLobbyLeave(client: AuthenticatedSocket): void
  {
    client.data.lobby?.removeClient(client);
  }

}