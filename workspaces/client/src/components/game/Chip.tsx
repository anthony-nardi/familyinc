import Image from "next/image";
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
import { ChipValues } from "@familyinc/shared/common/GameState";

const ImageMap = {
  "1": Chip1,
  "2": Chip2,
  "3": Chip3,
  "4": Chip4,
  "5": Chip5,
  "6": Chip6,
  "7": Chip7,
  "8": Chip8,
  "9": Chip9,
  "10": Chip10,
};

export default function Chip({
  chipValue,
  chipCount,
}: {
  chipValue: ChipValues;
  chipCount: number;
}) {
  if (!chipCount) {
    return null;
  }

  const images = [];

  for (let i = 0; i < chipCount; i++) {
    images.push(
      <Image priority src={ImageMap[chipValue]} height="40" width="40" key={i} className={`chip-image-${chipValue}`} />
    );
  }
  return <>{images}</>;
}
