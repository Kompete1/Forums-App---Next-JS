"use client";

import { useFormStatus } from "react-dom";
import type { ForumCategory } from "@/lib/db/categories";

type CreateThreadFormProps = {
  categories: ForumCategory[];
  defaultCategoryId: string;
  hasError?: boolean;
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

export function CreateThreadForm({ categories, defaultCategoryId, hasError = false, action }: CreateThreadFormProps) {
  return (
    <form action={action} className="card stack">
      <h2>Create thread</h2>
      {hasError ? <p className="thread-status locked">Could not publish thread. Please try again.</p> : null}
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
        <input id="thread-title" name="title" type="text" required minLength={1} maxLength={120} />
      </div>
      <div className="field">
        <label htmlFor="thread-body">Body</label>
        <textarea id="thread-body" name="body" required minLength={1} maxLength={5000} rows={7} />
      </div>
      <SubmitButton />
    </form>
  );
}
