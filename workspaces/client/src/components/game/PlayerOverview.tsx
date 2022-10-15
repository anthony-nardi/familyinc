import { colorToBorderColorClass, colorToTextColorClass, Colors } from "../../constants/colorToCssClass";
import Chip from "./Chip";
import Diamonds from "./Diamonds";

export default function PlayerOverview({
  playerInfo,
  score,
  chips,
  diamonds,
  isCurrentPlayer,
  you,
}) {
  const { userName, isHost, color  } = playerInfo;

  const textColor = colorToTextColorClass[color];
  const borderColor = colorToBorderColorClass[color]
  
  const isActivePlayerClassName = isCurrentPlayer ? "active" : "inactive";

  return (
    <div className={`${isActivePlayerClassName} ${borderColor} border-2`} key={color}>
      <span className={textColor}>{userName}</span>
      {isHost && " (Host)"}
      {you && " (You)"}
      <div className={textColor}>
        Score:
        {score}
      </div>
      <div>
        <Diamonds count={diamonds} />
      </div>
      <div className="chips">
        {chips &&
          Object.entries(chips).map(([chipValue, chipCount]) => {
            return <Chip chipValue={chipValue} chipCount={chipCount} />;
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
