"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type ProjectPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

/**
 * Pagination component for navigating through project pages.
 */
export function ProjectPagination({ currentPage, totalPages, onPageChange }: ProjectPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = [];
  const showPages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
  let endPage = Math.min(totalPages, startPage + showPages - 1);

  if (endPage - startPage + 1 < showPages) {
    startPage = Math.max(1, endPage - showPages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Button variant="secondary" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        <ChevronLeft className="size-4" />
        Previous
      </Button>

      {startPage > 1 && (
        <>
          <Button variant="secondary" size="sm" onClick={() => onPageChange(1)}>
            1
          </Button>
          {startPage > 2 && <span className="px-2 text-sm text-[--muted-foreground]">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "secondary"}
          size="sm"
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2 text-sm text-[--muted-foreground]">...</span>}
          <Button variant="secondary" size="sm" onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </Button>
        </>
      )}

      <Button variant="secondary" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Next
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
