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

function authorInitial(value: string | null) {
  const source = (value ?? "").trim();
  if (!source) {
    return "U";
  }

  return source.slice(0, 1).toUpperCase();
}

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
      <div className="thread-list">
        {threads.map((thread, index) => {
          const repliesCount = repliesCountByThreadId[thread.id] ?? 0;
          const authorLabel = thread.author_display_name ?? thread.author_id;
          return (
            <article key={thread.id} className="thread-row">
              <div className="thread-row-main">
                <div className="inline-actions thread-row-head">
                  <h3 className="thread-row-title">
                    <Link href={`/forum/${thread.id}`} className="focus-link">
                      {thread.title}
                    </Link>
                  </h3>
                  {showRecentBadgeOnFirst && index === 0 ? <p className="filter-chip">Recently posted</p> : null}
                </div>
                <p className="thread-snippet">
                  {thread.body.slice(0, 220)}
                  {thread.body.length > 220 ? "..." : ""}
                </p>
                <div className="thread-meta-row">
                  <span>{thread.category_name ?? "Unknown category"}</span>
                  <span>Started by {authorLabel}</span>
                  <span>{new Date(thread.created_at).toLocaleString()}</span>
                </div>
                <div className="thread-pills-row">
                  <span className={`thread-status-pill ${thread.is_locked ? "locked" : "open"}`}>
                    {thread.is_locked ? "Locked" : "Open"}
                  </span>
                  <span className="thread-info-pill">{repliesCount} replies</span>
                  <span className="thread-info-pill">Last activity {new Date(thread.last_activity_at).toLocaleString()}</span>
                  {thread.source_newsletter_id ? (
                    <span className="thread-info-pill">Linked newsletter: {thread.source_newsletter_title ?? "Newsletter topic"}</span>
                  ) : null}
                </div>
              </div>
              <div className="thread-row-aside">
                <div className="thread-author-badge" aria-hidden>
                  {authorInitial(authorLabel)}
                </div>
                <p className="meta thread-aside-author">{authorLabel}</p>
                <Link href={`/forum/${thread.id}`} className="btn-link focus-link">
                  Open thread
                </Link>
              </div>
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
