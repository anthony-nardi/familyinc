import {
  colorToBorderColorClass,
  colorToTextColorClass,
} from "../../constants/colorToCssClass";
import Chip from "./Chip";
import Diamonds from "./Diamonds";
import { playSound } from "@utils/sound";
import { useEffect, useRef } from "react";

export default function PlayerOverview({
  playerInfo,
  score,
  chips,
  diamonds,
  isCurrentPlayer,
  you,
}: {
  playerInfo: any;
  score: number;
  chips: any;
  diamonds: number;
  isCurrentPlayer: boolean;
  you: boolean;
}) {
  const { userName, isHost, color } = playerInfo;

  // @ts-expect-error anys
  const textColor = colorToTextColorClass[color];
  // @ts-expect-error anys
  const borderColor = colorToBorderColorClass[color];

  const isActivePlayerClassName = isCurrentPlayer ? "active" : "inactive";

  const prevChipCount = useRef<number>(0);

  const totalNumberOfChipsHeld: number = chips
    ? (Object.values(chips).reduce(
      // @ts-expect-error figure out
      (sum: number, count: number) => {
        return sum + count;
      },
      0
    ) as number)
    : 0;

  useEffect(() => {
    if (diamonds) {
      playSound("/sounds/receive_diamond.wav");
    }
  }, [diamonds]);

  useEffect(() => {
    if (
      totalNumberOfChipsHeld === prevChipCount.current + 1 ||
      totalNumberOfChipsHeld === 1
    ) {
      playSound("/sounds/draw_chip.mp3");
    }

    if (totalNumberOfChipsHeld > prevChipCount.current + 1) {
      playSound("/sounds/steal_chips.mp3");
    }

    prevChipCount.current = totalNumberOfChipsHeld;
  }, [totalNumberOfChipsHeld]);

  return (
    <div
      className={`${isActivePlayerClassName} ${borderColor} border-2 mb-1`}
      key={color}
    >
      <span className={textColor}>{userName}</span>
      {isHost && " (Host)"}
      {you && " (You)"}
      <div className={`${textColor} text-2xl`}>
        {typeof score === "number" && `Score: ${score}`}
      </div>
      <div>
        <Diamonds count={diamonds} />
      </div>
      <div className="chips">
        {chips &&
          Object.entries(chips).map(([chipValue, chipCount], index) => {
            return (
              // @ts-expect-error any
              <Chip chipValue={chipValue} chipCount={chipCount} key={index} />
            );
          })}
      </div>
      <span
        className="
        hidden 
        text-lime-400 
        text-rose-500 
        text-blue-500
        text-orange-500
        text-fuchsia-500
        text-yellow-300 
        text-stone-300
        border-lime-400 
        border-rose-500 
        border-blue-500
        border-orange-500
        border-fuchsia-500
        border-yellow-300 
        border-stone-300
        "
      >
        hidden
      </span>
    </div>
  );
}
