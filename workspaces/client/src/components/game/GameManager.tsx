import useSocketManager from "@hooks/useSocketManager";
import { useEffect } from "react";
import { Listener } from "@components/websocket/types";
import { ServerEvents } from "@familyinc/shared/server/ServerEvents";
import { ServerPayloads } from "@familyinc/shared/server/ServerPayloads";
import { useRecoilState } from "recoil";
import { CurrentLobbyState } from "@components/game/states";
import Introduction from "@components/game/Introduction";
import Game from "@components/game/Game";
import { useRouter } from "next/router";
import { showNotification } from "@mantine/notifications";
import { playSound } from "@utils/sound";

export default function GameManager() {
  const router = useRouter();
  const { sm } = useSocketManager();
  const [lobbyState, setLobbyState] = useRecoilState(CurrentLobbyState);

  useEffect(() => {
    sm.connect();

    const onLobbyState: Listener<
      ServerPayloads[ServerEvents.LobbyState]
    > = async (data) => {
      setLobbyState(data);

      router.query.lobby = data.lobbyId;

      await router.push(
        {
          pathname: "/",
          query: { ...router.query },
        },
        undefined,
        {}
      );
    };

    const onGameMessage: Listener<ServerPayloads[ServerEvents.GameMessage]> = ({
      color,
      message,
      sound
    }: {
      color: any;
      message: string;
      sound?: string
    }) => {
      showNotification({
        message,
        color,
        autoClose: 6000,
      });
    };

    const onGameSound: Listener<ServerPayloads[ServerEvents.GameSound]> = ({
      sound
    }: {
      sound: string
    }) => {
      if (sound === 'bust') {
        playSound('/sounds/bust.mp3')
      }
      if (sound === 'pass_turn') {
        playSound('/sounds/pass_turn.wav')
      }
    }

    sm.registerListener(ServerEvents.LobbyState, onLobbyState);
    sm.registerListener(ServerEvents.GameMessage, onGameMessage);
    sm.registerListener(ServerEvents.GameSound, onGameSound)
    return () => {
      sm.removeListener(ServerEvents.LobbyState, onLobbyState);
      sm.removeListener(ServerEvents.GameMessage, onGameMessage);
      sm.removeListener(ServerEvents.GameSound, onGameSound)
    };
  }, []);

  if (lobbyState === null) {
    return <Introduction />;
  }

  return <Game />;
}
