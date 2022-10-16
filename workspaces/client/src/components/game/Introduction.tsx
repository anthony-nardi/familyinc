import useSocketManager from "@hooks/useSocketManager";
import { ClientEvents } from "@familyinc/shared/client/ClientEvents";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { emitEvent } from "@utils/analytics";
import { Divider, Select, TextInput, Button } from "@mantine/core";

export default function Introduction() {
  const router = useRouter();
  const { sm } = useSocketManager();
  const [userName, setUserName] = useState("");

  const onJoinLobby = () => {
    sm.emit({
      event: ClientEvents.LobbyJoin,
      data: {
        lobbyId: router.query.lobby,
        userName,
      },
    });
  };

  const onCreateLobby = () => {
    sm.emit({
      event: ClientEvents.LobbyCreate,
      data: {
        delayBetweenRounds: 60,
        userName,
      },
    });

    emitEvent("lobby_create");
  };

  return (
    <div className="mt-4">
      <div className="mb-8">
        <h1>Family Inc.</h1>
        <h6>Designed by Reiner Knizia</h6>
      </div>
      <TextInput
        label="Username"
        onChange={(event) => setUserName(event.currentTarget.value)}
      />

      <div className="mt-5 text-center flex justify-between">
        {router.query.lobby ? (
          <Button
            variant="white"
            onClick={() => onJoinLobby()}
            disabled={!userName}
          >
            Join lobby
          </Button>
        ) : (
          <Button
            variant="white"
            onClick={() => onCreateLobby()}
            disabled={!userName}
          >
            Create lobby
          </Button>
        )}
      </div>
    </div>
  );
}
