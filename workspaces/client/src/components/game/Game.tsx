import { ClientEvents } from "@familyinc/shared/client/ClientEvents";
import useSocketManager from "@hooks/useSocketManager";
import { useRecoilValue } from "recoil";
import { CurrentLobbyState } from "@components/game/states";
import { Badge, LoadingOverlay, Overlay, Button, Select } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { emitEvent } from "@utils/analytics";
import { PlayersOverview } from "./PlayersOverview";
import { useState, useEffect, useRef } from "react";
import { playSound } from '../../utils/sound'
import Chip from "./Chip";
import styled from 'styled-components'
import { CSSTransition } from 'react-transition-group';
import AnimatedChips from './AnimatedChips'


export default function Game() {
  const { sm } = useSocketManager();
  const currentLobbyState = useRecoilValue(CurrentLobbyState)!;
  const clientId = sm.getSocketId()!;
  const isHost = currentLobbyState.hostId === clientId;
  const currentPlayer =
    currentLobbyState.currentPlayer &&
    currentLobbyState.clients[currentLobbyState.currentPlayer] &&
    currentLobbyState.clients[currentLobbyState.currentPlayer].userName;
  const [selectedBotValue, setBotValue] = useState("0");
  const [isAnimating, setIsAnimating] = useState(false)

  const onReplay = () => {
    sm.emit({
      event: ClientEvents.LobbyCreate,
      data: {
        userName: currentLobbyState.clients[clientId].userName,
      },
    });

    emitEvent("lobby_create");
  };

  useEffect(() => {
    if (currentLobbyState.winner) {
      playSound("/sounds/win.mp3");
    }
  }, [currentLobbyState.winner]);

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
      data: { bots: selectedBotValue },
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

  const possibleBots = 7 - currentLobbyState.playersCount;

  const botOptions = [
    {
      value: "0",
      label: "Add 0 bots",
    },
  ];

  for (let i = 1; i <= possibleBots; i++) {
    botOptions.push({
      value: `${i}`,
      label: `Add ${i} bots`,
    });
  }

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

      <div className="grid grid-cols-7 gap-4 relative select-none">
        {currentLobbyState.hasFinished && (
          <Overlay opacity={0.6} color="#000" blur={2} zIndex={5} />
        )}
        <LoadingOverlay visible={!currentLobbyState.hasStarted} />
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
          {(currentLobbyState.playersCount > 1 || selectedBotValue !== "0") &&
            isHost && (
              <Button className="btn" onClick={startGame}>
                Start game
              </Button>
            )}
        </div>
      )}

      {!currentLobbyState.hasStarted &&
        isHost &&
        currentLobbyState.playersCount < 7 && (
          <Select
            label="Add bots"
            data={botOptions}
            value={selectedBotValue}
            onChange={(val) => {
              if (typeof val === "string") {
                setBotValue(val);
              }
            }}
          />
        )}

      {currentLobbyState.hasStarted &&
        clientId === currentLobbyState.currentPlayer &&
        !currentLobbyState.hasFinished && (
          <div className="text-center my-2 flex space-x-4 justify-center">
            <Button
              className="btn"
              onClick={drawChip}
              disabled={clientId !== currentLobbyState.currentPlayer}
            >
              Draw Chip{" "}
            </Button>

            <Button
              className="btn"
              onClick={passTurn}
              disabled={clientId !== currentLobbyState.currentPlayer}
            >
              Pass Turn{" "}
            </Button>
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
      <AnimatedChips />
    </div>
  );
}
