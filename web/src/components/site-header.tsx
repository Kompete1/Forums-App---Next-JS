/* eslint-disable @next/next/no-html-link-for-pages */
import { createClient } from "@/lib/supabase/server";
import { canCurrentUserModerateThreads } from "@/lib/db/moderation";
import { getUnreadNotificationCount } from "@/lib/db/notifications";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const canModerate = user ? await canCurrentUserModerateThreads().catch(() => false) : false;
  const unreadCount = user ? await getUnreadNotificationCount().catch(() => 0) : 0;
  const unreadLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        {/* Use full document navigations for auth-sensitive routes to avoid stale prefetched payloads. */}
        <a href="/" className="site-brand">
          SA Racing Forum
        </a>
        <nav className="site-nav" aria-label="Primary">
          <a href="/forum">
            Forum
          </a>
          <a href="/categories">
            Categories
          </a>
          <a href="/newsletter">
            Newsletter
          </a>
          {user ? (
            <a href="/notifications" className="notifications-link">
              Notifications
              {unreadCount > 0 ? <span className="unread-badge">{unreadLabel}</span> : null}
            </a>
          ) : null}
          {canModerate ? (
            <a href="/admin">
              Admin
            </a>
          ) : null}
          {canModerate ? (
            <a href="/moderation/reports">
              Moderation
            </a>
          ) : null}
          {user ? (
            <a href="/profile">
              Profile
            </a>
          ) : (
            <a href="/auth/login">
              Login
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
