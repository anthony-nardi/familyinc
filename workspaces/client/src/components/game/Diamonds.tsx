import Image from "next/image";
import { Diamond } from "@icons/index";
export default function Diamonds({ count }: {count: number }) {
  if (!count) {
    return null;
  }

  const images = [];

  for (let i = 0; i < count; i++) {
    images.push(<Image src={Diamond} height="40" width="40" />);
  }


  return images
}
