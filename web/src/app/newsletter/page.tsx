import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserNewsletterAdmin } from "@/lib/db/newsletter-admins";
import { createNewsletter, listNewsletters } from "@/lib/db/newsletters";
import { logServerError } from "@/lib/server/logging";
import { formatForumDateTime } from "@/lib/ui/date-time";

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
      logServerError("createNewsletterAction", error);
    }

    revalidatePath("/newsletter");
  }

  return (
    <main className="page-wrap stack">
      <h1>Newsletter</h1>
      <p className="meta">{user ? `Signed in as ${user.email}` : "Browsing as guest."}</p>

      {isAdmin ? (
        <section className="card stack">
          <h2>Create newsletter entry</h2>
          <form action={createNewsletterAction} className="stack">
            <div className="field">
              <label htmlFor="newsletter-title">Title</label>
              <input id="newsletter-title" name="title" type="text" required minLength={1} maxLength={160} />
            </div>
            <div className="field">
              <label htmlFor="newsletter-body">Body</label>
              <textarea id="newsletter-body" name="body" required minLength={1} maxLength={12000} rows={8} />
            </div>
            <button type="submit" className="btn btn-primary">
              Publish newsletter
            </button>
          </form>
        </section>
      ) : (
        <p className="empty-note">Newsletter publishing is restricted to admins.</p>
      )}

      <section>
        <h2>Latest entries</h2>
        {newsletters.length === 0 ? <p className="empty-note">No newsletter entries yet.</p> : null}
        <div className="thread-grid">
          {newsletters.map((item) => (
            <article key={item.id} className="card">
              <h3>{item.title}</h3>
              <p style={{ whiteSpace: "pre-wrap" }}>{item.body}</p>
              <p className="meta">
                By {item.author_display_name ?? item.author_id} on {formatForumDateTime(item.created_at)}
              </p>
              <div className="inline-actions">
                {user ? (
                  <Link href={`/forum/new?fromNewsletter=${encodeURIComponent(item.id)}`} className="btn btn-primary">
                    Start discussion
                  </Link>
                ) : (
                  <Link
                    href={`/auth/login?returnTo=${encodeURIComponent(`/forum/new?fromNewsletter=${item.id}`)}`}
                    className="btn btn-secondary"
                  >
                    Login to discuss
                  </Link>
                )}
                <Link href={`/forum?newsletter=${encodeURIComponent(item.id)}`} className="btn btn-secondary">
                  View discussions
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <p>
        <Link href="/forum" className="btn-link focus-link">
          Back to forum
        </Link>
      </p>
    </main>
  );
}
