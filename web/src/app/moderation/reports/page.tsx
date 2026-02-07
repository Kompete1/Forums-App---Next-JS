import Link from "next/link";
import { canCurrentUserModerateThreads } from "@/lib/db/moderation";
import { listReportsForModeration } from "@/lib/db/reports";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ModerationReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const canModerate = user ? await canCurrentUserModerateThreads().catch(() => false) : false;

  if (!canModerate) {
    return (
      <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: "56rem" }}>
        <h1>Moderation Reports</h1>
        <p>Access denied. Moderator or admin role required.</p>
        <p>
          <Link href="/forum">Forum</Link> | <Link href="/newsletter">Newsletter</Link>
        </p>
      </main>
    );
  }

  const reports = await listReportsForModeration();

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: "64rem" }}>
      <h1>Moderation Reports</h1>
      <p>
        <Link href="/forum">Forum</Link> | <Link href="/newsletter">Newsletter</Link>
      </p>

      {reports.length === 0 ? <p>No reports yet.</p> : null}

      <div style={{ display: "grid", gap: "1rem" }}>
        {reports.map((report) => (
          <article key={report.id} style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "1rem" }}>
            <p style={{ marginTop: 0, marginBottom: "0.5rem", fontWeight: 700 }}>
              {report.target_type === "thread" ? "Thread report" : "Reply report"}
            </p>
            <p style={{ margin: "0.25rem 0" }}>Target ID: {report.thread_id ?? report.reply_id}</p>
            {report.thread_title ? <p style={{ margin: "0.25rem 0" }}>Thread: {report.thread_title}</p> : null}
            {report.reply_body ? <p style={{ margin: "0.25rem 0" }}>Reply: {report.reply_body}</p> : null}
            <p style={{ margin: "0.25rem 0" }}>Reason: {report.reason}</p>
            {report.notes ? <p style={{ margin: "0.25rem 0" }}>Notes: {report.notes}</p> : null}
            <p style={{ marginBottom: 0, fontSize: "0.875rem", color: "#444" }}>
              Reporter: {report.reporter_display_name ?? report.reporter_id} | {new Date(report.created_at).toLocaleString()}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
