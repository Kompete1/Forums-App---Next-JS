"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useFormStatus } from "react-dom";
import { AttachmentPreviewList } from "@/components/attachment-preview-list";
import { MarkdownLitePreview } from "@/components/ui/markdown-lite-preview";

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
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const bodyMax = 5000;

  function onAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFiles = Array.from(event.target.files ?? []);
    setFiles(nextFiles);
  }

  function removeAttachment(index: number) {
    const nextFiles = files.filter((_, itemIndex) => itemIndex !== index);
    setFiles(nextFiles);
    syncInputFiles(attachmentInputRef.current, nextFiles);
  }

  return (
    <form action={action} className="stack composer-card" id="reply-composer">
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
      <div className="field">
        <label htmlFor={`reply-${threadId}`}>Add reply</label>
        {activeTab === "write" ? (
          <textarea
            id={`reply-${threadId}`}
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
      <div className="sticky-submit-row">
        <SubmitButton />
      </div>
    </form>
  );
}
