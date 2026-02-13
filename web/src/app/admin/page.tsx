import type { Metadata } from "next";
import Link from "next/link";
import { canCurrentUserModerateThreads } from "@/lib/db/moderation";
import { getAdminDashboardData } from "@/lib/db/admin-dashboard";
import { createClient } from "@/lib/supabase/server";
import { formatForumDateTime } from "@/lib/ui/date-time";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const canModerate = user ? await canCurrentUserModerateThreads().catch(() => false) : false;

  if (!canModerate) {
    return (
      <main className="page-wrap stack">
        <h1>Admin Dashboard</h1>
        <p className="empty-note">Access denied. Moderator or admin role required.</p>
        <Link href="/forum" className="btn-link focus-link">
          Back to forum
        </Link>
      </main>
    );
  }

  const dashboardData = await getAdminDashboardData().catch(() => null);

  return (
    <main className="page-wrap stack">
      <h1>Admin Dashboard</h1>
      <p className="meta">{user ? `Signed in as ${user.email}` : ""}</p>

      <div className="inline-actions">
        <Link href="/moderation/reports" className="btn btn-primary">
          Open reports
        </Link>
        <Link href="/resources" className="btn btn-secondary">
          Open resources
        </Link>
        <Link href="/forum" className="btn btn-secondary">
          Open forum
        </Link>
        <Link href="/notifications" className="btn btn-secondary">
          Open notifications
        </Link>
      </div>

      {!dashboardData ? <p className="empty-note">Dashboard data is unavailable right now. Try again in a moment.</p> : null}

      {dashboardData ? (
        <>
          <section className="admin-kpi-grid" aria-label="Dashboard totals">
            <article className="card stack-tight">
              <h2>Total reports</h2>
              <p className="admin-kpi-value">{dashboardData.totals.reports}</p>
            </article>
            <article className="card stack-tight">
              <h2>Total threads</h2>
              <p className="admin-kpi-value">{dashboardData.totals.threads}</p>
            </article>
            <article className="card stack-tight">
              <h2>Total replies</h2>
              <p className="admin-kpi-value">{dashboardData.totals.replies}</p>
            </article>
            <article className="card stack-tight">
              <h2>Total newsletters</h2>
              <p className="admin-kpi-value">{dashboardData.totals.newsletters}</p>
            </article>
            <article className="card stack-tight">
              <h2>Total users</h2>
              <p className="admin-kpi-value">{dashboardData.totals.users}</p>
            </article>
          </section>

          <section className="card stack-tight">
            <h2>Role snapshot</h2>
            <p className="meta">Role visibility is scoped by current RLS policies.</p>
            <div className="inline-actions">
              {dashboardData.myRoles.length > 0 ? (
                dashboardData.myRoles.map((role) => (
                  <span key={role} className="role-pill">
                    {role}
                  </span>
                ))
              ) : (
                <span className="empty-note">No roles found.</span>
              )}
            </div>
          </section>

          <div className="admin-panel-grid">
            <section className="card stack-tight">
              <h2>Recent reports</h2>
              {dashboardData.recentReports.length === 0 ? <p className="empty-note">No reports yet.</p> : null}
              {dashboardData.recentReports.map((report) => (
                <article key={report.id} className="stack-tight">
                  <p style={{ fontWeight: 700 }}>{report.target_type === "thread" ? "Thread report" : "Reply report"}</p>
                  <p className="meta">{formatForumDateTime(report.created_at)}</p>
                  <p>Reason: {report.reason}</p>
                </article>
              ))}
            </section>

            <section className="card stack-tight">
              <h2>Recent newsletters</h2>
              {dashboardData.recentNewsletters.length === 0 ? <p className="empty-note">No newsletter entries yet.</p> : null}
              {dashboardData.recentNewsletters.map((entry) => (
                <article key={entry.id} className="stack-tight">
                  <p style={{ fontWeight: 700 }}>{entry.title}</p>
                  <p className="meta">
                    By {entry.author_display_name ?? entry.author_id} on {formatForumDateTime(entry.created_at)}
                  </p>
                </article>
              ))}
            </section>

            <section className="card stack-tight">
              <h2>Recent threads</h2>
              {dashboardData.recentThreads.length === 0 ? <p className="empty-note">No threads yet.</p> : null}
              {dashboardData.recentThreads.map((thread) => (
                <article key={thread.id} className="stack-tight">
                  <Link href={`/forum/${encodeURIComponent(thread.id)}`} className="focus-link" style={{ fontWeight: 700 }}>
                    {thread.title}
                  </Link>
                  <p className="meta">
                    By {thread.author_display_name ?? thread.author_id} on {formatForumDateTime(thread.created_at)}
                  </p>
                  <p className={`thread-status ${thread.is_locked ? "locked" : "open"}`}>
                    {thread.is_locked ? "Locked" : "Open"}
                  </p>
                </article>
              ))}
            </section>
          </div>
        </>
      ) : null}
    </main>
  );
}
