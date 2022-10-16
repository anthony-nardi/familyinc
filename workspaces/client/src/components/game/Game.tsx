import { ClientEvents } from "@familyinc/shared/client/ClientEvents";
import useSocketManager from "@hooks/useSocketManager";
import { useRecoilValue } from "recoil";
import { CurrentLobbyState } from "@components/game/states";
import { Badge, LoadingOverlay, Overlay, Button } from "@mantine/core";
import { MantineColor } from "@mantine/styles";
import { showNotification } from "@mantine/notifications";
import { emitEvent } from "@utils/analytics";
import { PlayersOverview } from "./PlayersOverview";

export default function Game() {
  const { sm } = useSocketManager();
  const currentLobbyState = useRecoilValue(CurrentLobbyState)!;
  const clientId = sm.getSocketId()!;
  const isHost = currentLobbyState.hostId === clientId;
  const currentPlayer =
    currentLobbyState.currentPlayer &&
    currentLobbyState.clients[currentLobbyState.currentPlayer] &&
    currentLobbyState.clients[currentLobbyState.currentPlayer].userName;

  const onReplay = () => {
    sm.emit({
      event: ClientEvents.LobbyCreate,
      data: {
        delayBetweenRounds: currentLobbyState.delayBetweenRounds,
        userName: currentLobbyState.clients[clientId].userName,
      },
    });

    emitEvent("lobby_create");
  };

  const copyLobbyLink = async () => {
    const link = `${window.location.origin}?lobby=${currentLobbyState.lobbyId}`;
    await navigator.clipboard.writeText(link);

    showNotification({
      message: "Link copied to clipboard!",
      color: "green",
    });
  };

  const startGame = () => {
    sm.emit({
      event: ClientEvents.StartGame,
    });
  };

  const drawChip = () => {
    sm.emit({
      event: ClientEvents.DrawChip,
    });
  };

  const passTurn = () => {
    sm.emit({
      event: ClientEvents.PassTurn,
    });
  };

  return (
    <div>
      <div className="flex items-center mb-3 justify-center">
        <Badge variant="outline">
          {!currentLobbyState.hasStarted && (
            <span>Waiting for host to start game.</span>
          )}

          {currentLobbyState.hasStarted && !currentLobbyState.hasFinished && (
            <span>Current Player: {currentPlayer}</span>
          )}

          {currentLobbyState.hasStarted &&
            currentLobbyState.hasFinished &&
            currentLobbyState.winner && 
            currentLobbyState.clients[currentLobbyState.winner] && (
              <span>
                Winner:{" "}
                {currentLobbyState.clients[currentLobbyState.winner].userName}
              </span>
            )}
        </Badge>
      </div>

      {currentLobbyState.isSuspended && (
        <div className="text-center text-lg">lobby suspended... </div>
      )}

      <div className="grid grid-cols-7 gap-4 relative select-none">
        {currentLobbyState.hasFinished && (
          <Overlay opacity={0.6} color="#000" blur={2} zIndex={5} />
        )}
        <LoadingOverlay
          visible={
            !currentLobbyState.hasStarted || currentLobbyState.isSuspended
          }
        />
      </div>

      {currentLobbyState.hasFinished && isHost && (
        <div className="text-center my-2 flex flex-col">
          <button className="mt-3 self-center" onClick={onReplay}>
            Play again ?
          </button>
        </div>
      )}

      {!currentLobbyState.hasStarted && (
        <div className="text-center my-2 flex space-x-4 justify-center">
          <Button className="btn" onClick={copyLobbyLink}>
            Copy lobby link
          </Button>
          {currentLobbyState.playersCount > 1 && isHost && (
            <Button className="btn" onClick={startGame}>
              Start game
            </Button>
          )}
        </div>
      )}

      {currentLobbyState.hasStarted &&
        clientId === currentLobbyState.currentPlayer &&
        !currentLobbyState.hasFinished && (
          <div className="text-center my-2">
            <button
              className="btn"
              onClick={drawChip}
              disabled={clientId !== currentLobbyState.currentPlayer}
            >
              Draw Chip{" "}
            </button>

            <button
              className="btn"
              onClick={passTurn}
              disabled={clientId !== currentLobbyState.currentPlayer}
            >
              Pass Turn{" "}
            </button>
          </div>
        )}
      <PlayersOverview
        players={currentLobbyState.clients}
        scores={currentLobbyState.scores}
        chipsHeld={currentLobbyState.chipsHeld}
        diamondsHeld={currentLobbyState.diamondsHeld}
        currentPlayer={currentLobbyState.currentPlayer}
        myClientId={clientId}
      />
    </div>
  );
}
