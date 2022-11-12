import useSocketManager from "@hooks/useSocketManager";
import { ClientEvents } from "@familyinc/shared/client/ClientEvents";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { emitEvent } from "@utils/analytics";
import { Divider, Select, TextInput, Button, Title, List } from "@mantine/core";
import {
  Chip1,
  Chip2,
  Chip3,
  Chip4,
  Chip5,
  Chip6,
  Chip7,
  Chip8,
  Chip9,
  Chip10,
} from "@icons/index";
export default function Introduction() {
  const router = useRouter();
  const { sm } = useSocketManager();
  const [userName, setUserName] = useState("");
  const canvasRef = useRef(null);
  const chip1Ref = useRef(null);
  const chip2Ref = useRef(null);
  const chip3Ref = useRef(null);
  const chip4Ref = useRef(null);
  const chip5Ref = useRef(null);
  const chip6Ref = useRef(null);
  const chip7Ref = useRef(null);
  const chip8Ref = useRef(null);
  const chip9Ref = useRef(null);
  const chip10Ref = useRef(null);

  const chip1RenderRef = useRef(0);
  const chip2RenderRef = useRef(0);
  const chip3RenderRef = useRef(0);
  const chip4RenderRef = useRef(0);
  const chip5RenderRef = useRef(0);
  const chip6RenderRef = useRef(0);
  const chip7RenderRef = useRef(0);
  const chip8RenderRef = useRef(0);
  const chip9RenderRef = useRef(0);
  const chip10RenderRef = useRef(0);

  const draw = (ctx) => {
    ctx.fillStyle = "#000000";
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(chip1Ref.current, 500, chip1RenderRef.current, 40, 40);
    chip1RenderRef.current = chip1RenderRef.current + 1;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let animationFrameId;

    const render = () => {
      draw(context);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw]);

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
      <div className="canvas-container">
        <canvas
          id="canvas"
          ref={canvasRef}
          width={typeof window !== "undefined" ? window.innerWidth : 0}
          height={typeof window !== "undefined" ? window.innerHeight : 0}
        />
      </div>
      <div className="canvas-images">
        <img src={"/chip-1.png"} width="40" height="40" ref={chip1Ref} />
        <img src={"/chip-2.png"} width="40" height="40" ref={chip2Ref} />
        <img src={"/chip-3.png"} width="40" height="40" ref={chip3Ref} />
        <img src={"/chip-4.png"} width="40" height="40" ref={chip4Ref} />
        <img src={"/chip-5.png"} width="40" height="40" ref={chip5Ref} />
        <img src={"/chip-6.png"} width="40" height="40" ref={chip6Ref} />
        <img src={"/chip-7.png"} width="40" height="40" ref={chip7Ref} />
        <img src={"/chip-8.png"} width="40" height="40" ref={chip8Ref} />
        <img src={"/chip-9.png"} width="40" height="40" ref={chip9Ref} />
        <img src={"/chip-10.png"} width="40" height="40" ref={chip10Ref} />
      </div>
    </div>
  );
}
