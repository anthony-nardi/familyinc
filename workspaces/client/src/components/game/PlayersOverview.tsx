import { colorToCssClass as colors } from "../../constants/colorToCssClass";
import Chip from "./Chip";
import Diamonds from "./Diamonds";
import PlayerOverview from "./PlayerOverview";

export function PlayersOverview({ players, scores, diamondsHeld, chipsHeld, currentPlayer, myClientId }) {
  return (
    <div>
      {Object.keys(players).map((clientId) => {
        return <PlayerOverview key={clientId} you={clientId === myClientId} isCurrentPlayer={currentPlayer === clientId} playerInfo={players[clientId]} score={scores[clientId]} diamonds={diamondsHeld[clientId]} chips={chipsHeld[clientId]} />
      })}
    </div>
  );
}
