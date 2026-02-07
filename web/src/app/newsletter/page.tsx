import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserNewsletterAdmin } from "@/lib/db/newsletter-admins";
import { createNewsletter, listNewsletters } from "@/lib/db/newsletters";

export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const newsletters = await listNewsletters();
  const isAdmin = user ? await isCurrentUserNewsletterAdmin().catch(() => false) : false;

  async function createNewsletterAction(formData: FormData) {
    "use server";

    const title = String(formData.get("title") ?? "");
    const body = String(formData.get("body") ?? "");

    try {
      await createNewsletter({ title, body });
    } catch (error) {
      console.error("createNewsletterAction failed", error);
    }

    revalidatePath("/newsletter");
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: "56rem" }}>
      <h1>Newsletter</h1>
      <p>
        {user ? `Signed in as ${user.email}` : "Browsing as guest."} <Link href="/auth/login">Login</Link> |{" "}
        <Link href="/auth/signup">Sign up</Link> | <Link href="/forum">Forum</Link> |{" "}
        <Link href="/hello-forum">Hello Forum</Link>
      </p>

      {isAdmin ? (
        <section style={{ marginBottom: "2rem" }}>
          <h2>Create newsletter entry</h2>
          <form action={createNewsletterAction} style={{ display: "grid", gap: "0.75rem", maxWidth: "44rem" }}>
            <label htmlFor="newsletter-title">Title</label>
            <input id="newsletter-title" name="title" type="text" required minLength={1} maxLength={160} />
            <label htmlFor="newsletter-body">Body</label>
            <textarea id="newsletter-body" name="body" required minLength={1} maxLength={12000} rows={8} />
            <button type="submit">Publish newsletter</button>
          </form>
        </section>
      ) : (
        <p style={{ marginBottom: "2rem" }}>Newsletter publishing is restricted to admins.</p>
      )}

      <section>
        <h2>Latest entries</h2>
        {newsletters.length === 0 ? <p>No newsletter entries yet.</p> : null}
        <div style={{ display: "grid", gap: "1rem" }}>
          {newsletters.map((item) => (
            <article key={item.id} style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "1rem" }}>
              <h3 style={{ marginTop: 0 }}>{item.title}</h3>
              <p style={{ whiteSpace: "pre-wrap" }}>{item.body}</p>
              <p style={{ fontSize: "0.875rem", color: "#444", marginBottom: 0 }}>
                By {item.author_display_name ?? item.author_id} on {new Date(item.created_at).toLocaleString()}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
