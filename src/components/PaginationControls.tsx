"use client";
import { useQueryState } from "nuqs";
import { FC, useTransition } from "react";
import { Button } from "./Button";

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
  const [page, setPage] = useQueryState("page", { startTransition });
  const goToPage = (newPage: number) => {
    setPage(newPage.toString());
    window.scrollTo(0, 0);
  };

  return (
    <div className="mb-2 flex items-center justify-center gap-2 text-sm md:text-base">
      <Button onClick={() => goToPage(1)} disabled={currentPage === 1}>
        First
      </Button>
      <Button
        onClick={() => goToPage(Math.max(currentPage - 1, 1))}
        disabled={!hasPrevPage}
      >
        &lt;--
      </Button>

      <div>
        {currentPage} / {totalPageCount}
      </div>

      <Button
        onClick={() => goToPage(Math.min(currentPage + 1, totalPageCount))}
        disabled={!hasNextPage}
      >
        --&gt;
      </Button>
      <Button
        onClick={() => goToPage(totalPageCount)}
        disabled={currentPage === totalPageCount}
      >
        Last
      </Button>
    </div>
  );
};

export default PaginationControls;
