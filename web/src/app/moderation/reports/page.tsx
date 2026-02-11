import Link from "next/link";
import { canCurrentUserModerateThreads } from "@/lib/db/moderation";
import { listReportsForModeration } from "@/lib/db/reports";
import { createClient } from "@/lib/supabase/server";
import { formatForumDateTime } from "@/lib/ui/date-time";

export const dynamic = "force-dynamic";

export default async function ModerationReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const canModerate = user ? await canCurrentUserModerateThreads().catch(() => false) : false;

  if (!canModerate) {
    return (
      <main className="page-wrap stack">
        <h1>Moderation Reports</h1>
        <p className="empty-note">Access denied. Moderator or admin role required.</p>
        <Link href="/forum" className="btn-link focus-link">
          Back to forum
        </Link>
      </main>
    );
  }

  const reports = await listReportsForModeration();

  return (
    <main className="page-wrap stack">
      <h1>Moderation Reports</h1>
      <Link href="/forum" className="btn-link focus-link">
        Back to forum
      </Link>

      {reports.length === 0 ? <p className="empty-note">No reports yet.</p> : null}

      <div className="thread-grid">
        {reports.map((report) => (
          <article key={report.id} className="card">
            <p style={{ marginBottom: "0.5rem", fontWeight: 700 }}>
              {report.target_type === "thread" ? "Thread report" : "Reply report"}
            </p>
            <p>Target ID: {report.thread_id ?? report.reply_id}</p>
            {report.thread_title ? <p>Thread: {report.thread_title}</p> : null}
            {report.reply_body ? <p>Reply: {report.reply_body}</p> : null}
            <p>Reason: {report.reason}</p>
            {report.notes ? <p>Notes: {report.notes}</p> : null}
            <p className="meta">
              Reporter: {report.reporter_display_name ?? report.reporter_id} | {formatForumDateTime(report.created_at)}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
