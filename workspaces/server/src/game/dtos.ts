import { IsString, IsOptional } from 'class-validator';

export class LobbyCreateDto {
  @IsString()
  userName: string
}

export class LobbyJoinDto {
  @IsString()
  lobbyId: string;

  @IsString()
  userName: string

  @IsString()
  @IsOptional()
  clientUUID?: string
}
