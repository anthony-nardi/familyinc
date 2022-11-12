import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { LobbyManager } from '@app/game/lobby/lobby.manager';
import { GameService } from './game.service'
@Module({
  providers: [
    // Gateways
    GameGateway,

    // Services
    GameService,

    // Managers
    LobbyManager,
  ],
})
export class GameModule {
}
