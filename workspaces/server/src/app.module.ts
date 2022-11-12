import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GameModule } from './game/game.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { jwtModule } from './websocket/modules.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        '.env.local',
        '.env',
      ],
    }),
    ScheduleModule.forRoot(),
    jwtModule,
    GameModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
}
