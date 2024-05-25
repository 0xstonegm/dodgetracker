import { getAllDodgesByPlayer } from "@/src/data";
import DodgeTypesChart from "./DodgeTypesChart";

type DodgeTypesProps = {
  gameName: string;
  tagLine: string;
};

export default async function DodgeTypes(props: DodgeTypesProps) {
  const dodges = await getAllDodgesByPlayer(props.gameName, props.tagLine);

  const shortDodgeCount = dodges.filter((d) => d.lpLost <= 5).length;
  const longDodgeCount = dodges.filter((d) => d.lpLost > 5).length;

  return (
    <DodgeTypesChart
      data={[
        { type: "Short dodges", count: shortDodgeCount },
        { type: "Long dodges", count: longDodgeCount },
      ]}
    />
  );
}
