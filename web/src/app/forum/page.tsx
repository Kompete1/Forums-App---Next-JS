import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPost, deletePost, listPosts, updatePost } from "@/lib/db/posts";

export const dynamic = "force-dynamic";

export default async function ForumPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const posts = await listPosts();

  async function createPostAction(formData: FormData) {
    "use server";

    const title = String(formData.get("title") ?? "");
    const body = String(formData.get("body") ?? "");

    try {
      await createPost({ title, body });
    } catch (error) {
      console.error("createPostAction failed", error);
    }

    revalidatePath("/forum");
  }

  async function updatePostAction(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "");
    const title = String(formData.get("title") ?? "");
    const body = String(formData.get("body") ?? "");

    if (!id) {
      return;
    }

    try {
      await updatePost(id, { title, body });
    } catch (error) {
      console.error("updatePostAction failed", error);
    }

    revalidatePath("/forum");
  }

  async function deletePostAction(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "");

    if (!id) {
      return;
    }

    try {
      await deletePost(id);
    } catch (error) {
      console.error("deletePostAction failed", error);
    }

    revalidatePath("/forum");
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: "56rem" }}>
      <h1>Forum</h1>
      <p>
        {user ? `Signed in as ${user.email}` : "Browsing as guest."} <Link href="/auth/login">Login</Link> |{" "}
        <Link href="/auth/signup">Sign up</Link> | <Link href="/hello-forum">Hello Forum</Link>
      </p>

      {user ? (
        <section style={{ marginBottom: "2rem" }}>
          <h2>Create post</h2>
          <form action={createPostAction} style={{ display: "grid", gap: "0.75rem", maxWidth: "44rem" }}>
            <label htmlFor="title">Title</label>
            <input id="title" name="title" type="text" required minLength={1} maxLength={120} />
            <label htmlFor="body">Body</label>
            <textarea id="body" name="body" required minLength={1} maxLength={5000} rows={5} />
            <button type="submit">Create post</button>
          </form>
        </section>
      ) : null}

      <section>
        <h2>Latest posts</h2>
        {posts.length === 0 ? <p>No posts yet.</p> : null}
        <div style={{ display: "grid", gap: "1rem" }}>
          {posts.map((post) => {
            const isOwner = user?.id === post.author_id;

            return (
              <article key={post.id} style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "1rem" }}>
                <h3 style={{ marginTop: 0 }}>{post.title}</h3>
                <p style={{ whiteSpace: "pre-wrap" }}>{post.body}</p>
                <p style={{ fontSize: "0.875rem", color: "#444" }}>
                  By {post.author_id} on {new Date(post.created_at).toLocaleString()}
                </p>

                {isOwner ? (
                  <div style={{ display: "grid", gap: "0.75rem" }}>
                    <form action={updatePostAction} style={{ display: "grid", gap: "0.5rem" }}>
                      <input type="hidden" name="id" value={post.id} />
                      <label htmlFor={`title-${post.id}`}>Edit title</label>
                      <input
                        id={`title-${post.id}`}
                        name="title"
                        type="text"
                        defaultValue={post.title}
                        required
                        minLength={1}
                        maxLength={120}
                      />
                      <label htmlFor={`body-${post.id}`}>Edit body</label>
                      <textarea
                        id={`body-${post.id}`}
                        name="body"
                        defaultValue={post.body}
                        required
                        minLength={1}
                        maxLength={5000}
                        rows={4}
                      />
                      <button type="submit">Update</button>
                    </form>

                    <form action={deletePostAction}>
                      <input type="hidden" name="id" value={post.id} />
                      <button type="submit">Delete</button>
                    </form>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
