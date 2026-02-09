/* eslint-disable @next/next/no-html-link-for-pages */
import { getCurrentUser } from "@/lib/supabase/auth";
import { getUnreadNotificationCountForUser } from "@/lib/db/notifications";
import { listRolesByUserId } from "@/lib/db/roles";
import { HeaderUserMenu } from "@/components/header-user-menu";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const roles = user ? await listRolesByUserId(user.id).catch(() => []) : [];
  const canModerate = roles.includes("admin") || roles.includes("mod");
  const unreadCount = user ? await getUnreadNotificationCountForUser(user.id).catch(() => 0) : 0;
  const createThreadPath = user ? "/forum/new" : "/auth/login?returnTo=%2Fforum%2Fnew";

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
          <a href={createThreadPath} className="btn btn-primary site-nav-cta">
            New thread
          </a>
          {user ? (
            <HeaderUserMenu email={user.email ?? null} unreadCount={unreadCount} showAdminLinks={canModerate} />
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
