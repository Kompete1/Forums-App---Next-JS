import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Moderation",
  description: "How moderation works, how reports and appeals are handled, and expected response timelines.",
};

export default function ModerationPolicyPage() {
  return (
    <main className="page-wrap stack">
      <section className="stack-tight">
        <p className="kicker">Governance</p>
        <h1>Moderation Policy</h1>
        <p className="meta">Moderators enforce community rules consistently and keep discussions healthy and on topic.</p>
      </section>

      <section className="card stack">
        <h2>What moderators and admins do</h2>
        <ul className="stack-tight">
          <li>Review community reports and triage incidents.</li>
          <li>Lock or unlock threads when discussion becomes unsafe or unproductive.</li>
          <li>Remove content that violates forum guidelines.</li>
          <li>Apply consequences consistently and document key actions.</li>
        </ul>
      </section>

      <section className="card stack">
        <h2>How reporting works</h2>
        <ul className="stack-tight">
          <li>Users can report thread and reply content from discussion pages.</li>
          <li>Reports are reviewed by moderators/admins in moderation queues.</li>
          <li>Higher-risk cases are prioritized, especially safety or legal risk.</li>
        </ul>
      </section>

      <section className="card stack">
        <h2>Appeals process</h2>
        <p className="meta">
          Send appeals to{" "}
          <a href="mailto:peterj.swartz@outlook.com" className="focus-link">
            peterj.swartz@outlook.com
          </a>{" "}
          and include:
        </p>
        <ul className="stack-tight">
          <li>Your username/email used in the forum.</li>
          <li>Thread, reply, or report reference ID if available.</li>
          <li>Short explanation of why you believe the action should be reviewed.</li>
        </ul>
      </section>

      <section className="card stack">
        <h2>Response expectations</h2>
        <ul className="stack-tight">
          <li>We aim to send a first response within 48 hours.</li>
          <li>Urgent safety or legal concerns are prioritized.</li>
          <li>Response times are targets and can vary with queue volume.</li>
        </ul>
      </section>

      <section className="card stack">
        <h2>Scope boundary</h2>
        <p className="meta">
          Moderators are community facilitators, not official sporting authorities. For official rulings, schedules, and regulations, use{" "}
          <Link href="/resources" className="focus-link">
            Resources
          </Link>
          .
        </p>
        <p className="meta">This is an unofficial community site.</p>
      </section>
    </main>
  );
}
