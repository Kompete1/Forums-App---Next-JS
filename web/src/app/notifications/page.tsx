import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NotificationsRealtimeSync } from "@/components/notifications-realtime-sync";
import { listMyNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/db/notifications";
import { createClient } from "@/lib/supabase/server";
import { logServerError } from "@/lib/server/logging";

export const dynamic = "force-dynamic";

type NotificationsPageProps = {
  searchParams?: Promise<{
    page?: string | string[];
  }>;
};

function getParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function toPositiveInt(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}

function notificationsHref(page: number) {
  if (page <= 1) {
    return "/notifications";
  }

  return `/notifications?page=${page}`;
}

function formatNotificationMessage(input: {
  kind: string;
  actorDisplayName: string | null;
  actorId: string | null;
}) {
  const actorLabel = input.actorDisplayName ?? input.actorId ?? "Someone";

  if (input.kind === "reply_received") {
    return `${actorLabel} replied to your thread.`;
  }

  if (input.kind === "thread_reported") {
    return `${actorLabel} submitted a content report.`;
  }

  if (input.kind === "report_status_changed") {
    return "A report status changed.";
  }

  return "Notification";
}

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const page = toPositiveInt(getParamValue(resolvedSearchParams.page), 1);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const notificationsPage = await listMyNotifications({ page, pageSize: 20 });
  const totalPages = Math.max(1, Math.ceil(notificationsPage.total / notificationsPage.pageSize));

  async function markReadAction(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "");
    if (!id) {
      return;
    }

    try {
      await markNotificationRead(id);
    } catch (error) {
      logServerError("markReadAction", error);
    }

    revalidatePath("/notifications");
    revalidatePath("/");
  }

  async function markAllReadAction() {
    "use server";

    try {
      await markAllNotificationsRead();
    } catch (error) {
      logServerError("markAllReadAction", error);
    }

    revalidatePath("/notifications");
    revalidatePath("/");
  }

  return (
    <main className="page-wrap stack">
      <NotificationsRealtimeSync userId={user.id} />
      <section className="inline-actions">
        <h1>Notifications</h1>
        <form action={markAllReadAction}>
          <button type="submit" className="btn btn-secondary">
            Mark all as read
          </button>
        </form>
      </section>

      {notificationsPage.notifications.length === 0 ? <p className="empty-note">No notifications yet.</p> : null}

      <section className="stack">
        {notificationsPage.notifications.map((notification) => (
          <article key={notification.id} className={`card notification-item ${notification.is_read ? "notification-read" : "notification-unread"}`}>
            <p style={{ fontWeight: 700 }}>
              {formatNotificationMessage({
                kind: notification.kind,
                actorDisplayName: notification.actor_display_name,
                actorId: notification.actor_id,
              })}
            </p>
            <p className="meta">{new Date(notification.created_at).toLocaleString()}</p>
            <div className="inline-actions">
              {notification.thread_id ? (
                <Link href={`/forum/${notification.thread_id}`} className="btn-link focus-link">
                  Open thread
                </Link>
              ) : null}
              {!notification.is_read ? (
                <form action={markReadAction}>
                  <input type="hidden" name="id" value={notification.id} />
                  <button type="submit" className="btn btn-secondary">
                    Mark read
                  </button>
                </form>
              ) : (
                <span className="meta">Read</span>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="pagination">
        {notificationsPage.page > 1 ? (
          <Link href={notificationsHref(notificationsPage.page - 1)} className="btn btn-secondary">
            Previous
          </Link>
        ) : null}
        {notificationsPage.page < totalPages ? (
          <Link href={notificationsHref(notificationsPage.page + 1)} className="btn btn-secondary">
            Next
          </Link>
        ) : null}
      </section>
    </main>
  );
}
