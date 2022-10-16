import PlayerOverview from "./PlayerOverview";

export function PlayersOverview({
  players,
  scores,
  diamondsHeld,
  chipsHeld,
  currentPlayer,
  myClientId,
}: {
  players: any;
  scores: any;
  diamondsHeld: any;
  chipsHeld: any;
  currentPlayer: string | undefined;
  myClientId: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-1">
      {Object.keys(players).map((clientId) => {
        return (
          <PlayerOverview
            key={clientId}
            you={clientId === myClientId}
            isCurrentPlayer={currentPlayer === clientId}
            playerInfo={players[clientId]}
            score={scores[clientId]}
            diamonds={diamondsHeld[clientId]}
            chips={chipsHeld[clientId]}
          />
        );
      })}
    </div>
  );
}
