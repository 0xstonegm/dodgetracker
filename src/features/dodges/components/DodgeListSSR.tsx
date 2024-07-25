import PaginationControls from "../../../components/PaginationControls";
import { getDodges, getDodgesByPlayer, getDodgesCount } from "../../../data";
import { userRegionToRiotRegion } from "../../../regions";
import DodgeList from "./DodgeList";

interface DodgeListProps {
  pageNumber: number;
  userRegion: string;
  gameName?: string;
  tagLine?: string;
  statSiteButtons?: boolean;
  profileLink?: boolean;
}

const pageSize = 50;
const maxPages = 500;

export default async function DodgeListSSR({
  pageNumber,
  userRegion,
  gameName,
  tagLine,
  statSiteButtons = true,
  profileLink = true,
}: DodgeListProps) {
  const totalPageCount = Math.ceil(
    Math.min(
      maxPages,
      (await getDodgesCount(
        userRegionToRiotRegion(userRegion),
        gameName,
        tagLine,
      )) / pageSize,
    ),
  );

  pageNumber = (function () {
    if (isNaN(pageNumber)) {
      return 1;
    }
    return Math.min(Math.max(pageNumber, 1), totalPageCount);
  })();

  const dodges = await (async function () {
    // TODO: Refactor these two functions into one
    if (gameName === undefined || tagLine === undefined) {
      return getDodges(
        userRegionToRiotRegion(userRegion),
        pageSize,
        pageNumber,
      );
    }
    return getDodgesByPlayer(gameName, tagLine, pageSize, pageNumber);
  })();

  return (
    <>
      <DodgeList
        clientServerTimeDiff={0} // TODO: Improve this
        {...{
          userRegion,
          dodges,
          profileLink,
          statSiteButtons,
        }}
      />
      {totalPageCount > 1 && (
        <div className="flex justify-center">
          <PaginationControls
            currentPage={pageNumber}
            hasNextPage={pageNumber < totalPageCount}
            hasPrevPage={pageNumber > 1}
            totalPageCount={totalPageCount}
          />
        </div>
      )}
    </>
  );
}
