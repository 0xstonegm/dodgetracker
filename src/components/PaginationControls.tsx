"use client";
import { useQueryState } from "nuqs";
import { useTransition, type FC } from "react";
import { Button } from "./ui/button";

interface PaginationControlsProps {
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPageCount: number;
}

const PaginationControls: FC<PaginationControlsProps> = ({
  currentPage,
  hasNextPage,
  hasPrevPage,
  totalPageCount,
}) => {
  const [_, startTransition] = useTransition();
  const [_page, setPage] = useQueryState("page", { startTransition });
  const goToPage = async (newPage: number) => {
    await setPage(newPage.toString());
    window.scrollTo(0, 0);
  };

  return (
    <div className="mb-2 flex items-center justify-center gap-2 text-sm md:text-base">
      <Button
        className="px-2 py-1"
        variant={"secondary"}
        onClick={() => goToPage(1)}
        disabled={currentPage === 1}
      >
        First
      </Button>
      <Button
        className="px-2 py-1"
        variant={"secondary"}
        onClick={() => goToPage(Math.max(currentPage - 1, 1))}
        disabled={!hasPrevPage}
      >
        &lt;--
      </Button>

      <div>
        {currentPage} / {totalPageCount}
      </div>

      <Button
        className="px-2 py-1"
        variant={"secondary"}
        onClick={() => goToPage(Math.min(currentPage + 1, totalPageCount))}
        disabled={!hasNextPage}
      >
        --&gt;
      </Button>
      <Button
        className="px-2 py-1"
        variant={"secondary"}
        onClick={() => goToPage(totalPageCount)}
        disabled={currentPage === totalPageCount}
      >
        Last
      </Button>
    </div>
  );
};

export default PaginationControls;
