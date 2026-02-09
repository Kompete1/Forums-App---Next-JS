"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
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
      if (!onExpectedThreadPath || !hasReplyError) {
        clearDraft(pendingReply.draftKey);
        clearPendingClearReplyDraft();
      }
    }
  }, [pathname, searchParams]);

  return null;
}
