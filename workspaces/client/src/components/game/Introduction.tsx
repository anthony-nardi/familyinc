import useSocketManager from "@hooks/useSocketManager";
import { ClientEvents } from "@familyinc/shared/client/ClientEvents";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { emitEvent } from "@utils/analytics";
import { TextInput, Button, Title, List } from "@mantine/core";
import Canvas from "./Canvas";
import random from "../../utils/random";

let canvasRendered = false;

export default function Introduction() {
  const router = useRouter();
  const { sm } = useSocketManager();
  const [userName, setUserName] = useState("");
  const canvasContainerRef = useRef(null);
  const appContainerRef = useRef(null);
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
  const diamondRef = useRef(null);

  useEffect(() => {
    const refs = [
      chip1Ref,
      chip2Ref,
      chip3Ref,
      chip4Ref,
      chip5Ref,
      chip6Ref,
      chip7Ref,
      chip8Ref,
      chip9Ref,
      chip10Ref,
    ];
    if (canvasContainerRef.current && !canvasRendered) {
      canvasRendered = true;
      const items = [];
      // @ts-expect-error ignore

      const contentRect = appContainerRef.current.getBoundingClientRect()
      console.log(contentRect)

      const leftZone = [0, contentRect.left]
      // @ts-expect-error ignore

      const rightZone = [contentRect.right, canvasContainerRef.current.clientWidth]

      for (let i = 0; i < 25; i++) {
        const randomInt = Math.floor(random(1, refs.length));
        const randomSpeedScale = random(0.6, 1.3);
        const randomX = Math.random() < .5 ? random(leftZone[0], leftZone[1]) : random(rightZone[0], rightZone[1])
        const randomY = random(-4000, -500);
        items.push({
          ref: refs[randomInt],
          x: randomX,
          y: randomY,
          speed: randomSpeedScale * .8,
          scale: randomSpeedScale,
        });
      }
      for (let i = 0; i < 25; i++) {
        const randomInt = Math.floor(random(1, refs.length / 2));
        const randomSpeedScale = random(0.4, .7);
        const randomX = Math.random() < .5 ? random(leftZone[0], leftZone[1]) : random(rightZone[0], rightZone[1])
        const randomY = random(-1500, -500);
        items.push({
          ref: refs[randomInt],
          x: randomX,
          y: randomY,
          speed: randomSpeedScale * .8,
          scale: randomSpeedScale,
        });
      }
      for (let i = 0; i < 10; i++) {
        const randomSpeedScale = random(0.6, 1.5);
        const randomX = Math.random() < .5 ? random(leftZone[0], leftZone[1]) : random(rightZone[0], rightZone[1])
        const randomY = random(-2000, -500);
        items.push({
          ref: diamondRef,
          x: randomX,
          y: randomY,
          speed: randomSpeedScale * .8,
          scale: randomSpeedScale,
        })
      }
      const theCanvas = new Canvas(canvasContainerRef.current, {
        items,
      });

      theCanvas.start();
    }
  }, []);

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
    <div className="mt-4 mx-auto max-w-5xl flex" ref={appContainerRef}>
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
      <div className="canvas-container" ref={canvasContainerRef}></div>
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
        <img src={"/diamond.png"} width="40" height="40" ref={diamondRef} />
      </div>
    </div>
  );
}
