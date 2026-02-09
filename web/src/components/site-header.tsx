/* eslint-disable @next/next/no-html-link-for-pages */
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/supabase/auth";
import { listMyNotifications, markAllNotificationsRead, getUnreadNotificationCountForUser } from "@/lib/db/notifications";
import { listRolesByUserId } from "@/lib/db/roles";
import { formatNotificationMessage } from "@/lib/ui/notification-message";
import { HeaderUserMenu } from "@/components/header-user-menu";
import { HeaderNotificationMenu } from "@/components/header-notification-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const roles = user ? await listRolesByUserId(user.id).catch(() => []) : [];
  const canModerate = roles.includes("admin") || roles.includes("mod");
  const createThreadPath = user ? "/forum/new" : "/auth/login?returnTo=%2Fforum%2Fnew";

  const [unreadCount, notificationsPreview] = user
    ? await Promise.all([
        getUnreadNotificationCountForUser(user.id).catch(() => 0),
        listMyNotifications({ page: 1, pageSize: 5 }).catch(() => ({
          notifications: [],
          total: 0,
          page: 1,
          pageSize: 5,
        })),
      ])
    : [0, { notifications: [], total: 0, page: 1, pageSize: 5 }];

  async function markAllFromHeaderAction() {
    "use server";

    try {
      await markAllNotificationsRead();
    } catch {
      return;
    }

    revalidatePath("/");
    revalidatePath("/notifications");
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        {/* Use full document navigations for auth-sensitive routes to avoid stale prefetched payloads. */}
        <a href="/" className="site-brand">
          SA Racing Forum
        </a>
        <nav className="site-nav" aria-label="Primary">
          <div className="site-nav-group">
            <a href="/forum" className="site-nav-link">Forum</a>
            <a href="/categories" className="site-nav-link">Categories</a>
            <a href="/newsletter" className="site-nav-link">Newsletter</a>
          </div>
          <a href={createThreadPath} className="btn btn-primary site-nav-cta">
            New thread
          </a>
          <ThemeToggle />
          {user ? (
            <>
              <HeaderNotificationMenu
                unreadCount={unreadCount}
                previews={notificationsPreview.notifications.map((item) => ({
                  id: item.id,
                  message: formatNotificationMessage({
                    kind: item.kind,
                    actorDisplayName: item.actor_display_name,
                    actorId: item.actor_id,
                  }),
                  createdAt: item.created_at,
                  href: item.thread_id ? `/forum/${item.thread_id}` : "/notifications",
                  isRead: item.is_read,
                }))}
                markAllAction={markAllFromHeaderAction}
              />
              <HeaderUserMenu email={user.email ?? null} showAdminLinks={canModerate} />
            </>
          ) : (
            <span className="inline-actions">
              <a href="/auth/login">Login</a>
              <a href="/auth/signup">Sign up</a>
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
