import type { ThreadSort } from "@/lib/db/posts";

const ACTIVE_WINDOW_MS = 24 * 60 * 60 * 1000;
const POPULAR_REPLIES_THRESHOLD = 5;

export type ThreadSignal = "unanswered" | "active" | "popular";

type GetThreadSignalsInput = {
  repliesCount: number;
  lastActivityAt: string;
  now?: number;
};

export function getThreadSignals({ repliesCount, lastActivityAt, now = Date.now() }: GetThreadSignalsInput) {
  const signals: ThreadSignal[] = [];
  const activityTimestamp = Date.parse(lastActivityAt);
  const isActive = Number.isFinite(activityTimestamp) && now - activityTimestamp <= ACTIVE_WINDOW_MS;

  if (repliesCount === 0) {
    signals.push("unanswered");
  }
  if (isActive) {
    signals.push("active");
  }
  if (repliesCount >= POPULAR_REPLIES_THRESHOLD) {
    signals.push("popular");
  }

  return signals;
}

export function getSortLabel(sort: ThreadSort) {
  if (sort === "newest") {
    return "Newest first";
  }
  if (sort === "oldest") {
    return "Oldest first";
  }
  return "Most recent activity";
}
