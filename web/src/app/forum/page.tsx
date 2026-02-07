import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { listCategories } from "@/lib/db/categories";
import { createThread, deleteThread, listThreads, updateThread } from "@/lib/db/posts";
import { createReply, listRepliesByThreadIds } from "@/lib/db/replies";
import { getMyProfile, updateMyDisplayName } from "@/lib/db/profiles";

export const dynamic = "force-dynamic";

type ForumPageProps = {
  searchParams?: {
    category?: string;
  };
};

export default async function ForumPage({ searchParams }: ForumPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const categories = await listCategories();
  const selectedCategorySlug = searchParams?.category?.trim() ?? "";
  const selectedCategory = categories.find((category) => category.slug === selectedCategorySlug) ?? null;

  const allThreads = await listThreads();
  const threads = selectedCategory
    ? allThreads.filter((thread) => thread.category_id === selectedCategory.id)
    : allThreads;

  const repliesByThreadId = await listRepliesByThreadIds(threads.map((thread) => thread.id));
  const myProfile = user ? await getMyProfile().catch(() => null) : null;

  async function createThreadAction(formData: FormData) {
    "use server";

    const title = String(formData.get("title") ?? "");
    const body = String(formData.get("body") ?? "");
    const categoryId = String(formData.get("categoryId") ?? "");

    try {
      await createThread({ title, body, categoryId });
    } catch (error) {
      console.error("createThreadAction failed", error);
    }

    revalidatePath("/forum");
  }

  async function updateThreadAction(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "");
    const title = String(formData.get("title") ?? "");
    const body = String(formData.get("body") ?? "");
    const categoryId = String(formData.get("categoryId") ?? "");

    if (!id) {
      return;
    }

    try {
      await updateThread(id, { title, body, categoryId });
    } catch (error) {
      console.error("updateThreadAction failed", error);
    }

    revalidatePath("/forum");
  }

  async function deleteThreadAction(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "");

    if (!id) {
      return;
    }

    try {
      await deleteThread(id);
    } catch (error) {
      console.error("deleteThreadAction failed", error);
    }

    revalidatePath("/forum");
  }

  async function createReplyAction(formData: FormData) {
    "use server";

    const threadId = String(formData.get("threadId") ?? "");
    const body = String(formData.get("body") ?? "");

    if (!threadId) {
      return;
    }

    try {
      await createReply({ threadId, body });
    } catch (error) {
      console.error("createReplyAction failed", error);
    }

    revalidatePath("/forum");
  }

  async function updateDisplayNameAction(formData: FormData) {
    "use server";

    const displayName = String(formData.get("displayName") ?? "");

    try {
      await updateMyDisplayName(displayName);
    } catch (error) {
      console.error("updateDisplayNameAction failed", error);
    }

    revalidatePath("/forum");
  }

  const activeCategoryId = selectedCategory?.id ?? categories[0]?.id ?? "";

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: "64rem" }}>
      <h1>Forum</h1>
      <p>
        {user ? `Signed in as ${user.email}` : "Browsing as guest."} <Link href="/auth/login">Login</Link> |{" "}
        <Link href="/auth/signup">Sign up</Link> | <Link href="/hello-forum">Hello Forum</Link>
      </p>

      {user ? (
        <section style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h2 style={{ marginTop: 0 }}>Profile</h2>
          <p style={{ marginTop: 0 }}>
            Current display name: <strong>{myProfile?.display_name ?? "(not set)"}</strong>
          </p>
          <form action={updateDisplayNameAction} style={{ display: "grid", gap: "0.75rem", maxWidth: "24rem" }}>
            <label htmlFor="displayName">Display name</label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              defaultValue={myProfile?.display_name ?? ""}
              placeholder="Enter display name"
              maxLength={40}
            />
            <button type="submit">Save display name</button>
          </form>
        </section>
      ) : null}

      <section style={{ marginBottom: "2rem" }}>
        <h2>Categories</h2>
        <p style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/forum" style={{ fontWeight: selectedCategory ? "normal" : "bold" }}>
            All
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/forum?category=${encodeURIComponent(category.slug)}`}
              style={{ fontWeight: selectedCategory?.id === category.id ? "bold" : "normal" }}
            >
              {category.name}
            </Link>
          ))}
        </p>
      </section>

      {user ? (
        <section style={{ marginBottom: "2rem" }}>
          <h2>Create thread</h2>
          <form action={createThreadAction} style={{ display: "grid", gap: "0.75rem", maxWidth: "44rem" }}>
            <label htmlFor="thread-category">Category</label>
            <select id="thread-category" name="categoryId" defaultValue={activeCategoryId} required>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <label htmlFor="thread-title">Title</label>
            <input id="thread-title" name="title" type="text" required minLength={1} maxLength={120} />
            <label htmlFor="thread-body">Body</label>
            <textarea id="thread-body" name="body" required minLength={1} maxLength={5000} rows={5} />
            <button type="submit">Create thread</button>
          </form>
        </section>
      ) : null}

      <section>
        <h2>
          Threads{selectedCategory ? ` in ${selectedCategory.name}` : ""}
        </h2>
        {threads.length === 0 ? <p>No threads yet.</p> : null}

        <div style={{ display: "grid", gap: "1rem" }}>
          {threads.map((thread) => {
            const isOwner = user?.id === thread.author_id;
            const replies = repliesByThreadId[thread.id] ?? [];

            return (
              <article key={thread.id} style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "1rem" }}>
                <h3 style={{ marginTop: 0 }}>{thread.title}</h3>
                <p style={{ whiteSpace: "pre-wrap" }}>{thread.body}</p>
                <p style={{ fontSize: "0.875rem", color: "#444" }}>
                  Category: {thread.category_name ?? "Unknown"} | By {thread.author_display_name ?? thread.author_id} on{" "}
                  {new Date(thread.created_at).toLocaleString()}
                </p>

                {isOwner ? (
                  <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1rem" }}>
                    <form action={updateThreadAction} style={{ display: "grid", gap: "0.5rem" }}>
                      <input type="hidden" name="id" value={thread.id} />
                      <label htmlFor={`thread-category-${thread.id}`}>Edit category</label>
                      <select
                        id={`thread-category-${thread.id}`}
                        name="categoryId"
                        defaultValue={thread.category_id}
                        required
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <label htmlFor={`thread-title-${thread.id}`}>Edit title</label>
                      <input
                        id={`thread-title-${thread.id}`}
                        name="title"
                        type="text"
                        defaultValue={thread.title}
                        required
                        minLength={1}
                        maxLength={120}
                      />
                      <label htmlFor={`thread-body-${thread.id}`}>Edit body</label>
                      <textarea
                        id={`thread-body-${thread.id}`}
                        name="body"
                        defaultValue={thread.body}
                        required
                        minLength={1}
                        maxLength={5000}
                        rows={4}
                      />
                      <button type="submit">Update thread</button>
                    </form>

                    <form action={deleteThreadAction}>
                      <input type="hidden" name="id" value={thread.id} />
                      <button type="submit">Delete thread</button>
                    </form>
                  </div>
                ) : null}

                <section>
                  <h4 style={{ marginBottom: "0.5rem" }}>Replies</h4>
                  {replies.length === 0 ? <p>No replies yet.</p> : null}
                  <div style={{ display: "grid", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    {replies.map((reply) => (
                      <div key={reply.id} style={{ borderLeft: "3px solid #ccc", paddingLeft: "0.75rem" }}>
                        <p style={{ marginTop: 0, whiteSpace: "pre-wrap" }}>{reply.body}</p>
                        <p style={{ marginBottom: 0, fontSize: "0.875rem", color: "#444" }}>
                          By {reply.author_display_name ?? reply.author_id} on{" "}
                          {new Date(reply.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  {user ? (
                    <form action={createReplyAction} style={{ display: "grid", gap: "0.5rem" }}>
                      <input type="hidden" name="threadId" value={thread.id} />
                      <label htmlFor={`reply-${thread.id}`}>Add reply</label>
                      <textarea
                        id={`reply-${thread.id}`}
                        name="body"
                        required
                        minLength={1}
                        maxLength={5000}
                        rows={3}
                      />
                      <button type="submit">Post reply</button>
                    </form>
                  ) : null}
                </section>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
