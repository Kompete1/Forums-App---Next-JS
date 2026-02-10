import type { ThreadSort } from "@/lib/db/posts";

const ACTIVE_WINDOW_MS = 24 * 60 * 60 * 1000;
const POPULAR_REPLIES_THRESHOLD = 5;

export type ThreadSignal = "unanswered" | "active" | "popular";
export type SignalFilter = ThreadSignal | "all";

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

export function parseSignalFilter(raw: string): SignalFilter {
  const normalized = raw.trim().toLowerCase();
  if (normalized === "unanswered" || normalized === "active" || normalized === "popular") {
    return normalized;
  }
  return "all";
}

export function getSignalLabel(signal: SignalFilter) {
  if (signal === "unanswered") {
    return "Unanswered";
  }
  if (signal === "active") {
    return "Active";
  }
  if (signal === "popular") {
    return "Popular";
  }
  return "All";
}

type MatchesSignalFilterInput = {
  signal: SignalFilter;
  repliesCount: number;
  lastActivityAt: string;
  now?: number;
};

export function matchesSignalFilter({ signal, repliesCount, lastActivityAt, now = Date.now() }: MatchesSignalFilterInput) {
  if (signal === "all") {
    return true;
  }

  const signals = getThreadSignals({ repliesCount, lastActivityAt, now });
  return signals.includes(signal);
}
