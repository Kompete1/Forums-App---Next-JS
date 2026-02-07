import Link from "next/link";
import type { ForumThread } from "@/lib/db/posts";

type ThreadFeedListProps = {
  threads: ForumThread[];
  repliesCountByThreadId: Record<string, number>;
  total: number;
  page: number;
  totalPages: number;
  noResultsText: string;
  prevHref: string | null;
  nextHref: string | null;
  title?: string;
  subtitleChip?: string;
  showRecentBadgeOnFirst?: boolean;
};

export function ThreadFeedList({
  threads,
  repliesCountByThreadId,
  total,
  page,
  totalPages,
  noResultsText,
  prevHref,
  nextHref,
  title = "Threads",
  subtitleChip,
  showRecentBadgeOnFirst = false,
}: ThreadFeedListProps) {
  return (
    <section className="stack">
      <div className="inline-actions">
        <h2>{title}</h2>
        {subtitleChip ? <p className="filter-chip">{subtitleChip}</p> : null}
        <p className="meta">
          Page {page} of {totalPages} | {total} total
        </p>
      </div>
      {threads.length === 0 ? <p className="empty-note">{noResultsText}</p> : null}
      <div className="thread-grid">
        {threads.map((thread, index) => {
          const repliesCount = repliesCountByThreadId[thread.id] ?? 0;
          return (
            <article key={thread.id} className="card thread-item">
              {showRecentBadgeOnFirst && index === 0 ? <p className="filter-chip">Recently posted</p> : null}
              <h3>{thread.title}</h3>
              <p>
                {thread.body.slice(0, 220)}
                {thread.body.length > 220 ? "..." : ""}
              </p>
              <p className="meta">
                {thread.category_name ?? "Unknown"} | By {thread.author_display_name ?? thread.author_id} on{" "}
                {new Date(thread.created_at).toLocaleString()}
              </p>
              <p className={thread.is_locked ? "thread-status locked" : "thread-status open"}>
                {thread.is_locked ? "Locked" : "Open"} | {repliesCount} replies
              </p>
              <Link href={`/forum/${thread.id}`} className="btn-link focus-link">
                Open thread
              </Link>
            </article>
          );
        })}
      </div>
      <div className="pagination">
        {prevHref ? (
          <Link href={prevHref} className="btn btn-secondary">
            Previous
          </Link>
        ) : null}
        {nextHref ? (
          <Link href={nextHref} className="btn btn-secondary">
            Next
          </Link>
        ) : null}
      </div>
    </section>
  );
}
