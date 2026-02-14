import type { Metadata } from "next";
import Link from "next/link";
import { HeroCarousel } from "@/components/hero-carousel";
import { heroSlides } from "@/content/hero-slides";
import { listCategories } from "@/lib/db/categories";
import { listThreadsByAuthor, listThreadsPage } from "@/lib/db/posts";
import { listRepliesByAuthor } from "@/lib/db/replies";
import { listMyNotifications } from "@/lib/db/notifications";
import { getCurrentUser } from "@/lib/supabase/auth";
import { formatNotificationMessage } from "@/lib/ui/notification-message";
import { appendQueryParams } from "@/lib/ui/flash-message";
import { formatForumDateTime } from "@/lib/ui/date-time";

export const metadata: Metadata = {
  title: "Home",
  description: "South African motorsport forum with category discovery, latest threads, and racer-focused community discussions.",
};

export default async function HomePage() {
  const [categories, latest, user] = await Promise.all([
    listCategories(),
    listThreadsPage({ page: 1, pageSize: 6, sort: "newest" }),
    getCurrentUser(),
  ]);

  const [recentThreads, recentReplies, recentNotifications] = user
    ? await Promise.all([
        listThreadsByAuthor(user.id, 3).catch(() => []),
        listRepliesByAuthor(user.id, 3).catch(() => []),
        listMyNotifications({ page: 1, pageSize: 3 }).catch(() => ({ notifications: [] as never[] })),
      ])
    : [[], [], { notifications: [] as never[] }];

  return (
    <main className="page-wrap stack">
      <HeroCarousel slides={heroSlides} />

      <section className="stack">
        <div>
          <p className="kicker">Browse Categories</p>
          <h2>Find Your Racing Lane</h2>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <article key={category.id} className="card category-card">
              <div className="stack-tight">
                <h3>{category.name}</h3>
                <p className="meta">{category.description ?? "Community discussions."}</p>
              </div>
              <div className="category-card-footer stack-tight">
                <p className="meta category-thread-count">{category.thread_count} threads</p>
                <Link href={`/forum/category/${encodeURIComponent(category.slug)}`} className="btn-link focus-link">
                  Browse threads
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="stack">
        <div className="inline-actions">
          <h2>Latest Threads</h2>
          <Link href="/forum" className="btn-link focus-link">
            View all
          </Link>
        </div>
        <div className="thread-grid">
          {latest.threads.map((thread) => (
            <article key={thread.id} className="card thread-item">
              <h3>{thread.title}</h3>
              <p>
                {thread.body.slice(0, 160)}
                {thread.body.length > 160 ? "..." : ""}
              </p>
              <p className="meta">
                {thread.category_name ?? "Uncategorized"} | by {thread.author_display_name ?? "Member"}
              </p>
              <Link href={`/forum/${thread.id}`} className="btn-link focus-link">
                Read thread
              </Link>
            </article>
          ))}
          {latest.threads.length === 0 ? <p className="empty-note">No threads yet.</p> : null}
        </div>
      </section>

      {user ? (
        <section className="card stack" aria-label="Your recent activity">
          <div className="inline-actions">
            <h2>Your recent activity</h2>
            <Link href="/profile?tab=activity" className="btn-link focus-link">
              Open activity tab
            </Link>
          </div>
          <p className="meta">Signed in as {user.email}</p>
          <div className="profile-activity-grid">
            <article className="stack-tight">
              <h3>My Threads</h3>
              {recentThreads.length === 0 ? <p className="empty-note">No threads published yet.</p> : null}
              {recentThreads.map((thread) => (
                <Link key={thread.id} href={`/forum/${thread.id}`} className="activity-row focus-link">
                  <span>{thread.title}</span>
                  <span className="meta">{formatForumDateTime(thread.last_activity_at)}</span>
                </Link>
              ))}
            </article>
            <article className="stack-tight">
              <h3>My Replies</h3>
              {recentReplies.length === 0 ? <p className="empty-note">No replies posted yet.</p> : null}
              {recentReplies.map((reply) => (
                <Link key={reply.id} href={`/forum/${reply.thread_id}`} className="activity-row focus-link">
                  <span>{reply.thread_title ?? "Thread"}</span>
                  <span className="meta">{reply.body.slice(0, 70)}{reply.body.length > 70 ? "..." : ""}</span>
                </Link>
              ))}
            </article>
            <article className="stack-tight">
              <h3>Notifications</h3>
              {recentNotifications.notifications.length === 0 ? <p className="empty-note">No recent notifications.</p> : null}
              {recentNotifications.notifications.map((item) => (
                <Link
                  key={item.id}
                  href={item.thread_id ? `/forum/${item.thread_id}` : "/notifications"}
                  className="activity-row focus-link"
                >
                  <span>
                    {formatNotificationMessage({
                      kind: item.kind,
                      actorDisplayName: item.actor_display_name,
                      actorId: item.actor_id,
                    })}
                  </span>
                  <span className="meta">{formatForumDateTime(item.created_at)}</span>
                </Link>
              ))}
            </article>
          </div>
        </section>
      ) : (
        <section className="card stack" aria-label="Guest account call to action">
          <h2>Join the Community</h2>
          <p className="meta">Sign in to post threads, reply, and report content for moderation review.</p>
          <div className="inline-actions">
            <Link href={appendQueryParams("/auth/login", { returnTo: "/forum" })} className="btn btn-primary">
              Login
            </Link>
            <Link href="/auth/signup" className="btn btn-secondary">
              Sign up
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
