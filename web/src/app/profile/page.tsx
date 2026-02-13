/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfileByUserId, updateDisplayNameByUserId } from "@/lib/db/profiles";
import { listThreadsByAuthor } from "@/lib/db/posts";
import { listRepliesByAuthor } from "@/lib/db/replies";
import { listMyNotifications } from "@/lib/db/notifications";
import { getCurrentUser } from "@/lib/supabase/auth";
import { logServerError } from "@/lib/server/logging";
import { appendQueryParams } from "@/lib/ui/flash-message";
import { formatNotificationMessage } from "@/lib/ui/notification-message";
import { formatForumDateTime } from "@/lib/ui/date-time";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type ProfilePageProps = {
  searchParams?: Promise<{
    next?: string | string[];
    tab?: string | string[];
  }>;
};

function getSafeNextPath(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
  const candidate = raw.trim();

  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//") || candidate.startsWith("/profile")) {
    return null;
  }

  return candidate;
}

function getTab(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
  return raw === "activity" ? "activity" : "account";
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await getCurrentUser();

  if (!user) {
    redirect(appendQueryParams("/auth/login", { returnTo: "/profile" }));
  }
  const userId = user.id;

  const nextPath = getSafeNextPath(resolvedSearchParams.next);
  if (nextPath) {
    redirect(nextPath);
  }

  const tab = getTab(resolvedSearchParams.tab);
  const [myProfile, recentThreads, recentReplies, recentNotifications] = await Promise.all([
    getProfileByUserId(userId).catch(() => null),
    listThreadsByAuthor(userId, 6).catch(() => []),
    listRepliesByAuthor(userId, 6).catch(() => []),
    listMyNotifications({ page: 1, pageSize: 6 }).catch(() => ({ notifications: [] as never[], total: 0, page: 1, pageSize: 6 })),
  ]);

  async function updateDisplayNameAction(formData: FormData) {
    "use server";

    const displayName = String(formData.get("displayName") ?? "");

    try {
      await updateDisplayNameByUserId(userId, displayName);
    } catch (error) {
      logServerError("updateDisplayNameAction", error);
    }

    revalidatePath("/profile");
  }

  return (
    <main className="page-wrap stack">
      <section>
        <p className="kicker">Account</p>
        <h1>Profile</h1>
        <p className="meta">Signed in as {user.email}</p>
      </section>

      <section className="inline-actions">
        <Link href="/profile" className={`filter-chip ${tab === "account" ? "filter-chip-active" : ""}`}>
          Account
        </Link>
        <Link href="/profile?tab=activity" className={`filter-chip ${tab === "activity" ? "filter-chip-active" : ""}`}>
          Activity
        </Link>
      </section>

      {tab === "account" ? (
        <>
          <section className="card stack">
            <h2>Display name</h2>
            <p className="meta">
              Current display name: <strong>{myProfile?.display_name ?? "(not set)"}</strong>
            </p>
            <form action={updateDisplayNameAction} className="field" style={{ maxWidth: "24rem" }}>
              <label htmlFor="displayName">Display name</label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                defaultValue={myProfile?.display_name ?? ""}
                placeholder="Enter display name"
                maxLength={40}
              />
              <button type="submit" className="btn btn-primary">
                Save display name
              </button>
            </form>
          </section>

          <section className="card stack">
            <h2>Session</h2>
            <div className="inline-actions">
              <form action="/auth/logout" method="post">
                <button type="submit" className="btn btn-secondary">
                  Logout
                </button>
              </form>
              <a href="/forum" className="btn-link focus-link">
                Back to forum
              </a>
            </div>
          </section>
        </>
      ) : (
        <section className="stack profile-activity-grid">
          <article className="card stack">
            <div className="inline-actions">
              <h2>My Threads</h2>
              <p className="meta">{recentThreads.length} recent</p>
            </div>
            {recentThreads.length === 0 ? <p className="empty-note">No threads published yet.</p> : null}
            <div className="stack-tight">
              {recentThreads.map((thread) => (
                <Link key={thread.id} href={`/forum/${thread.id}`} className="activity-row focus-link">
                  <span>{thread.title}</span>
                  <span className="meta">{formatForumDateTime(thread.last_activity_at)}</span>
                </Link>
              ))}
            </div>
          </article>

          <article className="card stack">
            <div className="inline-actions">
              <h2>My Replies</h2>
              <p className="meta">{recentReplies.length} recent</p>
            </div>
            {recentReplies.length === 0 ? <p className="empty-note">No replies posted yet.</p> : null}
            <div className="stack-tight">
              {recentReplies.map((reply) => (
                <Link key={reply.id} href={`/forum/${reply.thread_id}`} className="activity-row focus-link">
                  <span>{reply.thread_title ?? "Thread"}</span>
                  <span className="meta">{reply.body.slice(0, 70)}{reply.body.length > 70 ? "..." : ""}</span>
                </Link>
              ))}
            </div>
          </article>

          <article className="card stack">
            <div className="inline-actions">
              <h2>Recent Notifications</h2>
              <Link href="/notifications" className="btn-link focus-link">
                Open inbox
              </Link>
            </div>
            {recentNotifications.notifications.length === 0 ? <p className="empty-note">No recent notifications.</p> : null}
            <div className="stack-tight">
              {recentNotifications.notifications.map((item) => (
                <div key={item.id} className="activity-row">
                  <span>
                    {formatNotificationMessage({
                      kind: item.kind,
                      actorDisplayName: item.actor_display_name,
                      actorId: item.actor_id,
                    })}
                  </span>
                  <span className="meta">{formatForumDateTime(item.created_at)}</span>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}
    </main>
  );
}
