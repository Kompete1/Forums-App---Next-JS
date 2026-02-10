"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

type PageLink = {
  page: number;
  href: string;
  isCurrent: boolean;
};

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  pageLinks: PageLink[];
  nextHref: string | null;
  lastHref: string | null;
  pageSelectOptions: Array<{
    page: number;
    href: string;
  }>;
};

export function PaginationControls({
  page,
  totalPages,
  pageLinks,
  nextHref,
  lastHref,
  pageSelectOptions,
}: PaginationControlsProps) {
  const router = useRouter();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="pagination pagination-advanced" aria-label="Thread list pagination">
      {pageLinks.map((item) => (
        <Link
          key={item.page}
          href={item.href}
          className={`pagination-link ${item.isCurrent ? "pagination-link-current" : ""}`}
          aria-current={item.isCurrent ? "page" : undefined}
        >
          {item.page}
        </Link>
      ))}

      {nextHref ? (
        <Link href={nextHref} className="pagination-link pagination-link-nav" title="Next page" aria-label="Next page">
          Next
        </Link>
      ) : null}

      {lastHref ? (
        <Link href={lastHref} className="pagination-link pagination-link-nav" title="Last page" aria-label="Last page">
          &raquo;
        </Link>
      ) : null}

      <label className="pagination-select-wrap">
        <span className="meta">Page {page} of {totalPages}</span>
        <select
          aria-label="Jump to page"
          value={String(page)}
          onChange={(event) => {
            const targetPage = Number.parseInt(event.target.value, 10);
            const selectedOption = pageSelectOptions.find((item) => item.page === targetPage);
            if (selectedOption) {
              router.push(selectedOption.href);
            }
          }}
        >
          {pageSelectOptions.map((item) => (
            <option key={item.page} value={String(item.page)}>
              Page {item.page}
            </option>
          ))}
        </select>
      </label>
    </nav>
  );
}
