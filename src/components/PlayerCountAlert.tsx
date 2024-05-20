import { Info } from "lucide-react";
import { getLatestPlayerCount } from "../data";
import { userRegionToRiotRegion } from "../regions";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

type PlayerCountAlertProps = {
  userRegion: string;
};

export default async function PlayerCountAlert({
  userRegion,
}: PlayerCountAlertProps) {
  const playerCounts = await getLatestPlayerCount(
    userRegionToRiotRegion(userRegion),
  );
  const totalPlayerCount =
    playerCounts.masterCount +
    playerCounts.grandmasterCount +
    playerCounts.challengerCount;

  return (
    <>
      {totalPlayerCount <= 100 && (
        <Alert className="mt-2 w-5/6 border-2 dark:bg-zinc-800 md:w-full">
          <AlertTitle>
            <div className="flex items-center text-center">
              <Info className="mr-1 size-6 text-yellow-500" />
              <p>Few players!</p>
            </div>
          </AlertTitle>
          <AlertDescription>
            Currently there are few players in {userRegion.toUpperCase()} master
            and above ({totalPlayerCount} player(s)). Not many dodges will be
            detected.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
