import Link from "next/link";
import type { ForumThread } from "@/lib/db/posts";
import { getThreadSignals, type ThreadSignal } from "@/lib/ui/discovery-signals";
import { PaginationControls } from "@/components/pagination-controls";

type ThreadFeedListProps = {
  threads: ForumThread[];
  repliesCountByThreadId: Record<string, number>;
  threadLikeCountByThreadId?: Record<string, number>;
  total: number;
  page: number;
  totalPages: number;
  noResultsText: string;
  pageHref: (targetPage: number) => string;
  title?: string;
  subtitleChip?: string;
  contextLine?: string;
  showRecentBadgeOnFirst?: boolean;
};

function authorInitial(value: string | null) {
  const source = (value ?? "").trim();
  if (!source) {
    return "U";
  }

  return source.slice(0, 1).toUpperCase();
}

function signalLabel(signal: ThreadSignal) {
  if (signal === "unanswered") {
    return "Unanswered";
  }
  if (signal === "active") {
    return "Active";
  }
  return "Popular";
}

export function ThreadFeedList({
  threads,
  repliesCountByThreadId,
  threadLikeCountByThreadId = {},
  total,
  page,
  totalPages,
  noResultsText,
  pageHref,
  title = "Threads",
  subtitleChip,
  contextLine,
  showRecentBadgeOnFirst = false,
}: ThreadFeedListProps) {
  const pageStart = Math.max(1, page - 2);
  const pageEnd = Math.min(totalPages, page + 2);
  const pageLinks = Array.from({ length: pageEnd - pageStart + 1 }).map((_, offset) => {
    const linkPage = pageStart + offset;
    return {
      page: linkPage,
      href: pageHref(linkPage),
      isCurrent: linkPage === page,
    };
  });
  const nextHref = page < totalPages ? pageHref(page + 1) : null;
  const lastHref = page < totalPages ? pageHref(totalPages) : null;
  const pageSelectOptions = Array.from({ length: totalPages }).map((_, offset) => {
    const linkPage = offset + 1;
    return {
      page: linkPage,
      href: pageHref(linkPage),
    };
  });

  return (
    <section className="stack">
      <div className="inline-actions">
        <h2>{title}</h2>
        {subtitleChip ? <p className="filter-chip">{subtitleChip}</p> : null}
        {contextLine ? <p className="meta">{contextLine}</p> : null}
        <p className="meta">
          Page {page} of {totalPages} | {total} total
        </p>
      </div>
      {threads.length === 0 ? <p className="empty-note">{noResultsText}</p> : null}
      <div className="thread-list">
        {threads.map((thread, index) => {
          const repliesCount = repliesCountByThreadId[thread.id] ?? 0;
          const likeCount = threadLikeCountByThreadId[thread.id] ?? 0;
          const authorLabel = thread.author_display_name ?? thread.author_id;
          const signals = getThreadSignals({
            repliesCount,
            lastActivityAt: thread.last_activity_at,
          });
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
                  {signals.map((signal) => (
                    <span key={`${thread.id}-${signal}`} className={`thread-signal-pill thread-signal-pill-${signal}`}>
                      {signalLabel(signal)}
                    </span>
                  ))}
                  <span className="thread-info-pill">{repliesCount} replies</span>
                  <span className="thread-info-pill reaction-count-pill">{likeCount} likes</span>
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
      <PaginationControls
        page={page}
        totalPages={totalPages}
        pageLinks={pageLinks}
        nextHref={nextHref}
        lastHref={lastHref}
        pageSelectOptions={pageSelectOptions}
      />
    </section>
  );
}
