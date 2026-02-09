"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useFormStatus } from "react-dom";
import type { ForumCategory } from "@/lib/db/categories";
import { AttachmentPreviewList } from "@/components/attachment-preview-list";
import { MarkdownLitePreview } from "@/components/ui/markdown-lite-preview";
import { MarkdownToolbar } from "@/components/ui/markdown-toolbar";
import { useDraftAutosave } from "@/hooks/use-draft-autosave";
import { makeThreadDraftKey, setPendingClearNewThreadDraft } from "@/lib/ui/drafts";

type CreateThreadFormProps = {
  categories: ForumCategory[];
  defaultCategoryId: string;
  defaultTitle?: string;
  defaultBody?: string;
  sourceNewsletterId?: string | null;
  errorMessage?: string | null;
  action: (formData: FormData) => Promise<void>;
};

const markdownPreviewEnabled = process.env.NEXT_PUBLIC_ENABLE_MARKDOWN_PREVIEW === "1";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Publishing..." : "Publish thread"}
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

export function CreateThreadForm({
  categories,
  defaultCategoryId,
  defaultTitle = "",
  defaultBody = "",
  sourceNewsletterId = null,
  errorMessage = null,
  action,
}: CreateThreadFormProps) {
  const bodyInputRef = useRef<HTMLTextAreaElement | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [title, setTitle] = useState(defaultTitle);
  const [body, setBody] = useState(defaultBody);
  const [files, setFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const draftKey = makeThreadDraftKey(defaultCategoryId || "default");
  const draft = useDraftAutosave({
    draftKey,
    values: { title, body },
  });

  function onSubmit() {
    setPendingClearNewThreadDraft(draftKey);
  }

  function onAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(event.target.files ?? []));
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
    setTitle(restored.title ?? "");
    setBody(restored.body);
  }

  function discardDraft() {
    draft.discardDraft();
  }

  function onFormInput() {
    if (activeTab === "preview") {
      setActiveTab("write");
    }
  }

  return (
    <form action={action} className="card stack composer-card" onSubmit={onSubmit} onInput={onFormInput}>
      <div className="inline-actions composer-header-row">
        <h2>Create thread</h2>
        {markdownPreviewEnabled ? (
          <div className="tab-switch" role="tablist" aria-label="Thread editor tabs">
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
      <p className="meta">Use clear titles and include concrete details so others can help quickly.</p>
      {draft.hasRestorableDraft ? (
        <div className="draft-banner">
          <p className="meta">
            Draft found from {draft.restorableUpdatedAt ? new Date(draft.restorableUpdatedAt).toLocaleString() : "earlier"}.
          </p>
          <div className="inline-actions">
            <button type="button" className="btn btn-secondary" onClick={restoreDraft}>
              Restore draft
            </button>
            <button type="button" className="btn btn-ghost" onClick={discardDraft}>
              Discard
            </button>
          </div>
        </div>
      ) : null}
      {sourceNewsletterId ? <input type="hidden" name="sourceNewsletterId" value={sourceNewsletterId} /> : null}
      {errorMessage ? <p className="thread-status locked">{errorMessage}</p> : null}
      <div className="field">
        <label htmlFor="thread-category">Category</label>
        <select id="thread-category" name="categoryId" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="thread-title">Title</label>
        <input
          id="thread-title"
          name="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          minLength={1}
          maxLength={120}
          placeholder="Example: Killarney season schedule update"
        />
        <p className="meta">{title.length} / 120 characters</p>
      </div>
      <div className="field">
        <label htmlFor="thread-body">Body</label>
        <MarkdownToolbar textareaRef={bodyInputRef} value={body} onChange={setBody} />
        {activeTab === "write" ? (
          <textarea
            ref={bodyInputRef}
            id="thread-body"
            name="body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            required
            minLength={1}
            maxLength={5000}
            rows={9}
            placeholder="Share context, what you tried, and what answer you need."
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
        <label htmlFor="thread-attachments">Images (optional, up to 3)</label>
        <input
          ref={attachmentInputRef}
          id="thread-attachments"
          name="attachments"
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
