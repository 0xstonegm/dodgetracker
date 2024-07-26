import Image from "next/image";
import { countryFlagURL } from "../utils";

export default function PlayerFlag(props: {
  countryCode: string;
  height: number;
}) {
  const width = Math.floor(props.height * 1.5);

  return (
    <Image
      alt={`${props.countryCode} Flag`}
      src={countryFlagURL(props.countryCode)}
      quality={100}
      width={props.height}
      height={width}
      unoptimized
    ></Image>
  );
}
