import { IsInt, IsNumber, IsString, Max, Min } from 'class-validator';

export class LobbyCreateDto
{
  @IsInt()
  @Min(60)
  @Max(120)
  delayBetweenRounds: number;

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
