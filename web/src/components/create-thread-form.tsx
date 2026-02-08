"use client";

import { useFormStatus } from "react-dom";
import type { ForumCategory } from "@/lib/db/categories";

type CreateThreadFormProps = {
  categories: ForumCategory[];
  defaultCategoryId: string;
  defaultTitle?: string;
  defaultBody?: string;
  sourceNewsletterId?: string | null;
  errorMessage?: string | null;
  action: (formData: FormData) => Promise<void>;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Publishing..." : "Publish thread"}
    </button>
  );
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
  return (
    <form action={action} className="card stack">
      <h2>Create thread</h2>
      {sourceNewsletterId ? <input type="hidden" name="sourceNewsletterId" value={sourceNewsletterId} /> : null}
      {errorMessage ? <p className="thread-status locked">{errorMessage}</p> : null}
      <div className="field">
        <label htmlFor="thread-category">Category</label>
        <select id="thread-category" name="categoryId" defaultValue={defaultCategoryId} required>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="thread-title">Title</label>
        <input id="thread-title" name="title" type="text" defaultValue={defaultTitle} required minLength={1} maxLength={120} />
      </div>
      <div className="field">
        <label htmlFor="thread-body">Body</label>
        <textarea id="thread-body" name="body" defaultValue={defaultBody} required minLength={1} maxLength={5000} rows={7} />
      </div>
      <div className="field">
        <label htmlFor="thread-attachments">Images (optional, up to 3)</label>
        <input
          id="thread-attachments"
          name="attachments"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
        />
        <p className="meta">Allowed: JPG, PNG, WEBP, GIF. Max 5MB each.</p>
      </div>
      <SubmitButton />
    </form>
  );
}
