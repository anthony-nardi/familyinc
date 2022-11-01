import useSocketManager from "@hooks/useSocketManager";
import { ClientEvents } from "@familyinc/shared/client/ClientEvents";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { emitEvent } from "@utils/analytics";
import { Divider, Select, TextInput, Button, Title, List } from "@mantine/core";

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
        userName,
      },
    });

    emitEvent("lobby_create");
  };

  return (
    <div className="mt-4 mx-auto max-w-5xl flex">
      <div className="basis-1/2">
        <div className="mb-8">
          <Title order={1}>Family Inc.</Title>
          <Title order={6}>Designed by Reiner Knizia</Title>
        </div>
        <TextInput
          className="max-w-sm"
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
      <div className="basis-1/2">
        <div>
          <Title order={2}>Objective</Title>
          <p>First to reach 100 points wins.</p>
        </div>
        <div className="mt-5">
          <Title order={3}>Setup</Title>
          <p>
            There are 135 chips with values 1 through 10. Put them all in a
            face-down pile.
          </p>
        </div>
        <div className="mt-5">
          <Title order={3}>How to play</Title>
          <p>
            At the beginning of your turn, sum the values of all your chips and
            add that to your score. Remove those chips from the game. (this will
            be 0 for the first turn of the game).
          </p>
          <p className="mt-4">Then, draw chips until:</p>
          <List listStyleType="disc">
            <List.Item>
              you draw a chip whose value matches a chip you already have
            </List.Item>
            <List.Item>you decide to stop</List.Item>
          </List>

          <p className="mt-4">
            When you draw a chip whose value matches a chip you already have,
            remove from the game all the chips you have drawn this turn. If
            you&lsquo;ve drawn 3 chips or less this turn you receive a diamond.
            3 diamonds and you&lsquo;ll automatically score 50 points, those
            diamonds are removed from the game. Then your turn ends.
          </p>
          <p className="mt-4">
            When you decide to stop, you steal each chip owned by your opponents
            that match the values of any chip you&lsquo;ve drawn this turn. Then
            your turn ends.
          </p>
          <div className="mt-4">
            <Title order={5}>2-7 Players</Title>
            <p>
              There are 16 of each chips of values 1-5 and 11 of each chips of
              values 6-10.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
