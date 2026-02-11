import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NotificationsRealtimeSync } from "@/components/notifications-realtime-sync";
import { listMyNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/db/notifications";
import { createClient } from "@/lib/supabase/server";
import { logServerError } from "@/lib/server/logging";
import { appendQueryParams } from "@/lib/ui/flash-message";
import { formatNotificationMessage } from "@/lib/ui/notification-message";
import { formatForumDateTime } from "@/lib/ui/date-time";

export const dynamic = "force-dynamic";

type NotificationsPageProps = {
  searchParams?: Promise<{
    page?: string | string[];
    filter?: string | string[];
  }>;
};

type NotificationFilter = "all" | "unread" | "replies" | "reports";

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

function toFilter(value: string): NotificationFilter {
  if (value === "unread" || value === "replies" || value === "reports") {
    return value;
  }

  return "all";
}

function notificationsHref(page: number, filter: NotificationFilter) {
  const search = new URLSearchParams();
  if (page > 1) {
    search.set("page", String(page));
  }
  if (filter !== "all") {
    search.set("filter", filter);
  }

  const query = search.toString();
  return query ? `/notifications?${query}` : "/notifications";
}

function isVisibleInFilter(
  filter: NotificationFilter,
  notification: { is_read: boolean; kind: "reply_received" | "thread_reported" | "report_status_changed" },
) {
  if (filter === "unread") {
    return !notification.is_read;
  }

  if (filter === "replies") {
    return notification.kind === "reply_received";
  }

  if (filter === "reports") {
    return notification.kind === "thread_reported" || notification.kind === "report_status_changed";
  }

  return true;
}

function dateHeading(input: string) {
  return new Date(input).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const page = toPositiveInt(getParamValue(resolvedSearchParams.page), 1);
  const filter = toFilter(getParamValue(resolvedSearchParams.filter));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(appendQueryParams("/auth/login", { returnTo: notificationsHref(page, filter) }));
  }

  const notificationsPage = await listMyNotifications({ page, pageSize: 30 });
  const filteredNotifications = notificationsPage.notifications.filter((item) => isVisibleInFilter(filter, item));
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

  const groupedNotifications: { heading: string; items: typeof filteredNotifications }[] = [];
  for (const notification of filteredNotifications) {
    const heading = dateHeading(notification.created_at);
    const lastGroup = groupedNotifications[groupedNotifications.length - 1];
    if (!lastGroup || lastGroup.heading !== heading) {
      groupedNotifications.push({ heading, items: [notification] });
    } else {
      lastGroup.items.push(notification);
    }
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

      <section className="inline-actions">
        <Link href={notificationsHref(1, "all")} className={`filter-chip ${filter === "all" ? "filter-chip-active" : ""}`}>
          All
        </Link>
        <Link href={notificationsHref(1, "unread")} className={`filter-chip ${filter === "unread" ? "filter-chip-active" : ""}`}>
          Unread
        </Link>
        <Link href={notificationsHref(1, "replies")} className={`filter-chip ${filter === "replies" ? "filter-chip-active" : ""}`}>
          Replies
        </Link>
        <Link href={notificationsHref(1, "reports")} className={`filter-chip ${filter === "reports" ? "filter-chip-active" : ""}`}>
          Reports
        </Link>
      </section>

      {filteredNotifications.length === 0 ? <p className="empty-note">No notifications for this filter yet.</p> : null}

      <section className="stack">
        {groupedNotifications.map((group) => (
          <div key={group.heading} className="stack-tight">
            <h3 className="meta notification-date-heading">{group.heading}</h3>
            {group.items.map((notification) => (
              <article key={notification.id} className={`card notification-item ${notification.is_read ? "notification-read" : "notification-unread"}`}>
                <p style={{ fontWeight: 700 }}>
                  {formatNotificationMessage({
                    kind: notification.kind,
                    actorDisplayName: notification.actor_display_name,
                    actorId: notification.actor_id,
                  })}
                </p>
                <p className="meta">{formatForumDateTime(notification.created_at)}</p>
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
          </div>
        ))}
      </section>

      <section className="pagination">
        {notificationsPage.page > 1 ? (
          <Link href={notificationsHref(notificationsPage.page - 1, filter)} className="btn btn-secondary">
            Previous
          </Link>
        ) : null}
        {notificationsPage.page < totalPages ? (
          <Link href={notificationsHref(notificationsPage.page + 1, filter)} className="btn btn-secondary">
            Next
          </Link>
        ) : null}
      </section>
    </main>
  );
}
