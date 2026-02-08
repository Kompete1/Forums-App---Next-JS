import Link from "next/link";
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
        <Link href="/" className="site-brand" prefetch={false}>
          SA Racing Forum
        </Link>
        <nav className="site-nav" aria-label="Primary">
          <Link href="/forum" prefetch={false}>
            Forum
          </Link>
          <Link href="/categories" prefetch={false}>
            Categories
          </Link>
          <Link href="/newsletter" prefetch={false}>
            Newsletter
          </Link>
          {user ? (
            <Link href="/notifications" className="notifications-link" prefetch={false}>
              Notifications
              {unreadCount > 0 ? <span className="unread-badge">{unreadLabel}</span> : null}
            </Link>
          ) : null}
          {canModerate ? (
            <Link href="/admin" prefetch={false}>
              Admin
            </Link>
          ) : null}
          {canModerate ? (
            <Link href="/moderation/reports" prefetch={false}>
              Moderation
            </Link>
          ) : null}
          {user ? (
            <Link href="/profile" prefetch={false}>
              Profile
            </Link>
          ) : (
            <Link href="/auth/login" prefetch={false}>
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
