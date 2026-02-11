"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  makeReplyDraftKey,
  clearDraft,
  clearPendingClearNewThreadDraft,
  clearPendingClearReplyDraft,
  getPendingClearNewThreadDraft,
  getPendingClearReplyDraft,
} from "@/lib/ui/drafts";

export function DraftSubmissionCleanup() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const replyPosted = searchParams.get("replyPosted") === "1";
    if (replyPosted) {
      const match = pathname.match(/^\/forum\/([0-9a-f-]{36})$/i);
      if (match?.[1]) {
        clearDraft(makeReplyDraftKey(match[1]));
      }
    }

    const pendingThreadDraftKey = getPendingClearNewThreadDraft();
    if (pendingThreadDraftKey) {
      const onNewThreadPath = pathname === "/forum/new";
      const hasThreadError = Boolean(searchParams.get("errorCode") || searchParams.get("attachmentErrorCode"));
      if (!onNewThreadPath || !hasThreadError) {
        clearDraft(pendingThreadDraftKey);
        clearPendingClearNewThreadDraft();
      }
    }

    const pendingReply = getPendingClearReplyDraft();
    if (pendingReply) {
      const onExpectedThreadPath = pathname === `/forum/${pendingReply.threadId}`;
      const hasReplyError = Boolean(searchParams.get("replyErrorCode") || searchParams.get("replyAttachmentErrorCode"));
      const hasReplyPosted = replyPosted;
      if (!onExpectedThreadPath || hasReplyPosted) {
        clearDraft(pendingReply.draftKey);
        clearPendingClearReplyDraft();
      } else if (hasReplyError) {
        clearPendingClearReplyDraft();
      }
    }
  }, [pathname, searchParams]);

  return null;
}
