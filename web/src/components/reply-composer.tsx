"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useFormStatus } from "react-dom";
import { AttachmentPreviewList } from "@/components/attachment-preview-list";
import { MarkdownLitePreview } from "@/components/ui/markdown-lite-preview";
import { MarkdownToolbar } from "@/components/ui/markdown-toolbar";
import { useDraftAutosave } from "@/hooks/use-draft-autosave";
import { makeReplyDraftKey, setPendingClearReplyDraft } from "@/lib/ui/drafts";

type ReplyComposerProps = {
  threadId: string;
  action: (formData: FormData) => Promise<void>;
  errorMessage?: string | null;
  attachmentErrorMessage?: string | null;
};

const markdownPreviewEnabled = process.env.NEXT_PUBLIC_ENABLE_MARKDOWN_PREVIEW === "1";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Posting..." : "Post reply"}
    </button>
  );
}

function syncInputFiles(input: HTMLInputElement | null, files: File[]) {
  if (!input || typeof DataTransfer === "undefined") {
    return;
  }

  const dataTransfer = new DataTransfer();
  for (const file of files) {
    dataTransfer.items.add(file);
  }
  input.files = dataTransfer.files;
}

export function ReplyComposer({
  threadId,
  action,
  errorMessage = null,
  attachmentErrorMessage = null,
}: ReplyComposerProps) {
  const bodyInputRef = useRef<HTMLTextAreaElement | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const bodyMax = 5000;
  const draftKey = makeReplyDraftKey(threadId);
  const draft = useDraftAutosave({
    draftKey,
    values: { body },
  });

  useEffect(() => {
    const onQuote = (event: Event) => {
      const custom = event as CustomEvent<{ threadId: string; snippet: string }>;
      if (!custom.detail || custom.detail.threadId !== threadId) {
        return;
      }

      const snippet = custom.detail.snippet;
      setBody((current) => {
        if (!current.trim()) {
          return snippet;
        }
        return `${current.trimEnd()}\n\n${snippet}`;
      });
      setActiveTab("write");
      requestAnimationFrame(() => {
        bodyInputRef.current?.focus();
      });
    };

    window.addEventListener("forum:quote-reply", onQuote);
    return () => {
      window.removeEventListener("forum:quote-reply", onQuote);
    };
  }, [threadId]);

  function onAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFiles = Array.from(event.target.files ?? []);
    setFiles(nextFiles);
  }

  function removeAttachment(index: number) {
    const nextFiles = files.filter((_, itemIndex) => itemIndex !== index);
    setFiles(nextFiles);
    syncInputFiles(attachmentInputRef.current, nextFiles);
  }

  function restoreDraft() {
    const restored = draft.restoreDraft();
    if (!restored) {
      return;
    }
    setBody(restored.body);
    setActiveTab("write");
  }

  function onSubmit() {
    setPendingClearReplyDraft({
      threadId,
      draftKey,
    });
  }

  function onFormInput() {
    if (activeTab === "preview") {
      setActiveTab("write");
    }
  }

  return (
    <form action={action} className="stack composer-card" id="reply-composer" onSubmit={onSubmit} onInput={onFormInput}>
      <input type="hidden" name="threadId" value={threadId} />
      {attachmentErrorMessage ? <p className="thread-status locked">{attachmentErrorMessage}</p> : null}
      {errorMessage ? <p className="thread-status locked">{errorMessage}</p> : null}
      <div className="inline-actions composer-header-row">
        <h3>Add reply</h3>
        {markdownPreviewEnabled ? (
          <div className="tab-switch" role="tablist" aria-label="Reply editor tabs">
            <button
              type="button"
              className={`tab-btn ${activeTab === "write" ? "active" : ""}`}
              onClick={() => setActiveTab("write")}
              role="tab"
              aria-selected={activeTab === "write"}
            >
              Write
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "preview" ? "active" : ""}`}
              onClick={() => setActiveTab("preview")}
              role="tab"
              aria-selected={activeTab === "preview"}
            >
              Preview
            </button>
          </div>
        ) : null}
      </div>
      <p className="meta">Be specific, include context, and keep discussion respectful.</p>
      {draft.hasRestorableDraft ? (
        <div className="draft-banner">
          <p className="meta">
            Draft found from {draft.restorableUpdatedAt ? new Date(draft.restorableUpdatedAt).toLocaleString() : "earlier"}.
          </p>
          <div className="inline-actions">
            <button type="button" className="btn btn-secondary" onClick={restoreDraft}>
              Restore draft
            </button>
            <button type="button" className="btn btn-ghost" onClick={draft.discardDraft}>
              Discard
            </button>
          </div>
        </div>
      ) : null}
      <div className="field">
        <label htmlFor="reply-composer-body">Add reply</label>
        <MarkdownToolbar textareaRef={bodyInputRef} value={body} onChange={setBody} />
        {activeTab === "write" ? (
          <textarea
            ref={bodyInputRef}
            id="reply-composer-body"
            name="body"
            required
            minLength={1}
            maxLength={bodyMax}
            rows={5}
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        ) : (
          <>
            <input type="hidden" name="body" value={body} />
            <div className="preview-panel">
              <MarkdownLitePreview text={body} />
            </div>
          </>
        )}
        <p className="meta">{body.length} / 5000 characters</p>
      </div>
      <div className="field">
        <label htmlFor={`reply-attachments-${threadId}`}>Images (optional, up to 3)</label>
        <input
          ref={attachmentInputRef}
          id={`reply-attachments-${threadId}`}
          name="replyAttachments"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={onAttachmentChange}
        />
        <p className="meta">Allowed: JPG, PNG, WEBP, GIF. Max 5MB each.</p>
      </div>
      <AttachmentPreviewList files={files} onRemove={removeAttachment} />
      {draft.dirty ? <p className="meta">Unsaved changes will be restored if you reload this page.</p> : null}
      <div className="sticky-submit-row">
        <SubmitButton />
      </div>
    </form>
  );
}
