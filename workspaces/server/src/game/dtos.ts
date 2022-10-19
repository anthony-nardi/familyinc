import { IsInt, IsNumber, IsString, Max, Min } from 'class-validator';

export class LobbyCreateDto
{
  @IsString()
  userName: string
}

export class LobbyJoinDto
{
  @IsString()
  lobbyId: string;

  @IsString()
  userName: string
}
