export type DraftPayload = {
  body: string;
  title?: string;
  updatedAt: string;
};

export const DRAFT_PENDING_NEW_THREAD_KEY = "draft:pending-clear:new-thread";
export const DRAFT_PENDING_REPLY_KEY = "draft:pending-clear:reply";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function makeThreadDraftKey(categoryOrDefault: string) {
  const normalized = categoryOrDefault.trim() || "default";
  return `draft:new-thread:${normalized}`;
}

export function makeReplyDraftKey(threadId: string) {
  const normalized = threadId.trim();
  return `draft:reply:${normalized}`;
}

export function readDraft(key: string) {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as DraftPayload;
    if (!parsed || typeof parsed.body !== "string" || typeof parsed.updatedAt !== "string") {
      return null;
    }
    if (typeof parsed.title !== "undefined" && typeof parsed.title !== "string") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function writeDraft(key: string, payload: Omit<DraftPayload, "updatedAt">) {
  if (!canUseStorage()) {
    return;
  }

  const next: DraftPayload = {
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(key, JSON.stringify(next));
}

export function clearDraft(key: string) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(key);
}

export function valuesDiffer(a: { body: string; title?: string }, b: { body: string; title?: string }) {
  const aTitle = (a.title ?? "").trim();
  const bTitle = (b.title ?? "").trim();
  const aBody = a.body.trim();
  const bBody = b.body.trim();
  return aTitle !== bTitle || aBody !== bBody;
}

export function setPendingClearNewThreadDraft(draftKey: string) {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(DRAFT_PENDING_NEW_THREAD_KEY, draftKey);
}

export function getPendingClearNewThreadDraft() {
  if (typeof window === "undefined") {
    return "";
  }
  return window.sessionStorage.getItem(DRAFT_PENDING_NEW_THREAD_KEY) ?? "";
}

export function clearPendingClearNewThreadDraft() {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.removeItem(DRAFT_PENDING_NEW_THREAD_KEY);
}

export function setPendingClearReplyDraft(input: { threadId: string; draftKey: string }) {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(DRAFT_PENDING_REPLY_KEY, JSON.stringify(input));
}

export function getPendingClearReplyDraft() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(DRAFT_PENDING_REPLY_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { threadId?: string; draftKey?: string };
    if (!parsed.threadId || !parsed.draftKey) {
      return null;
    }
    return { threadId: parsed.threadId, draftKey: parsed.draftKey };
  } catch {
    return null;
  }
}

export function clearPendingClearReplyDraft() {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.removeItem(DRAFT_PENDING_REPLY_KEY);
}
