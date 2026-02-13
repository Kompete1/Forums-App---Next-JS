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
            <a href="/forum" className="site-nav-link">
              <span aria-hidden className="site-nav-icon">
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path d="M4 5h16v11H7l-3 3V5Zm2 2v7.2L6.2 14H18V7H6Z" fill="currentColor" />
                </svg>
              </span>
              Forum
            </a>
            <a href="/categories" className="site-nav-link">
              <span aria-hidden className="site-nav-icon">
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" fill="currentColor" />
                </svg>
              </span>
              Categories
            </a>
            <a href="/resources" className="site-nav-link">
              <span aria-hidden className="site-nav-icon">
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path d="M3 5h18v14H3V5Zm2 2v1.2l7 4.8 7-4.8V7l-7 4.8L5 7Z" fill="currentColor" />
                </svg>
              </span>
              Resources
            </a>
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
