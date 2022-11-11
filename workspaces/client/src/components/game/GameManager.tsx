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

export default function GameManager() {
  const router = useRouter();
  const { sm } = useSocketManager();
  const [lobbyState, setLobbyState] = useRecoilState(CurrentLobbyState);
  const clientId = sm.getSocketId();

  useEffect(() => {
    if (!clientId) {
      return;
    }

    console.log(`Client ID: ${clientId}`);
    const familyIncLocalStorageValues = localStorage.getItem("familyinc");

    if (familyIncLocalStorageValues) {
      const parsedFamilyIncLocalStorageValues = JSON.parse(
        familyIncLocalStorageValues
      );
      console.log(parsedFamilyIncLocalStorageValues);
      if (
        parsedFamilyIncLocalStorageValues &&
        (parsedFamilyIncLocalStorageValues.lobbyId === lobbyState?.lobbyId ||
          !parsedFamilyIncLocalStorageValues.lobbyId)
      ) {
        parsedFamilyIncLocalStorageValues.clientUUID =
          lobbyState?.clients[clientId].uuid;
        parsedFamilyIncLocalStorageValues.lobbyId = lobbyState?.lobbyId;
        console.log(parsedFamilyIncLocalStorageValues);
        localStorage.setItem(
          "familyinc",
          JSON.stringify(parsedFamilyIncLocalStorageValues)
        );
      }
    }
  }, [clientId]);

  useEffect(() => {
    sm.connect();

    const onLobbyState: Listener<
      ServerPayloads[ServerEvents.LobbyState]
    > = async (data) => {
      setLobbyState(data);

      router.query.lobby = data.lobbyId;
      const familyIncLocalStorageValues = localStorage.getItem("familyinc");

      if (familyIncLocalStorageValues) {
        const parsedFamilyIncLocalStorageValues = JSON.parse(
          familyIncLocalStorageValues
        );
        if (parsedFamilyIncLocalStorageValues.lobbyId !== data.lobbyId) {
          localStorage.setItem(
            "familyinc",
            JSON.stringify({
              lobbyId: data.lobbyId,
            })
          );
        }
      }

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
    }: {
      color: any;
      message: string;
    }) => {
      showNotification({
        message,
        color,
        autoClose: 6000,
      });
    };

    sm.registerListener(ServerEvents.LobbyState, onLobbyState);
    sm.registerListener(ServerEvents.GameMessage, onGameMessage);

    return () => {
      sm.removeListener(ServerEvents.LobbyState, onLobbyState);
      sm.removeListener(ServerEvents.GameMessage, onGameMessage);
    };
  }, []);

  if (lobbyState === null) {
    return <Introduction />;
  }

  return <Game />;
}
