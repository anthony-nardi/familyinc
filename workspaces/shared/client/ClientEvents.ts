export enum ClientEvents
{
  // General
  Ping = 'client.ping',

  // Lobby
  LobbyCreate = 'client.lobby.create',
  LobbyJoin = 'client.lobby.join',
  LobbyLeave = 'client.lobby.leave',
  StartGame = 'client.lobby.start',

  // Game
  DrawChip = 'client.lobby.drawchip',
  PassTurn = 'client.lobby.passturn'
}
