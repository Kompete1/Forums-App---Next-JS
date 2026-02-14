import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Community Guidelines",
  description: "Behavior, self-promotion, privacy, and enforcement expectations for SA Racing Forum discussions.",
};

export default function CommunityGuidelinesPage() {
  return (
    <main className="page-wrap stack">
      <section className="stack-tight">
        <p className="kicker">Community Standards</p>
        <h1>Community Guidelines</h1>
        <p className="meta">These guidelines keep discussion useful, respectful, and safer for everyone in the forum.</p>
      </section>

      <section className="card stack">
        <h2>Core behavior</h2>
        <ul className="stack-tight">
          <li>Be civil and respectful, even when you disagree.</li>
          <li>Stay on topic and search for existing threads before posting duplicates.</li>
          <li>No spam, manipulation, or low-value repetitive posting.</li>
          <li>No unsafe advice. Prioritize safety and verify rules through official organizers.</li>
          <li>No impersonation and no false claims of being an official authority.</li>
        </ul>
      </section>

      <section className="card stack">
        <h2>Self-promotion policy</h2>
        <p className="meta">We allow limited, relevant sharing when it helps the community.</p>
        <h3>Allowed</h3>
        <ul className="stack-tight">
          <li>Relevant products/services/content with clear context and transparency.</li>
          <li>Occasional promotion when the post is genuinely helpful and discussion-first.</li>
          <li>Disclosure of affiliations where applicable.</li>
        </ul>
        <h3>Not allowed</h3>
        <ul className="stack-tight">
          <li>Repetitive or aggressive promotion across multiple threads.</li>
          <li>Deceptive affiliate pushes or hidden commercial intent.</li>
          <li>Irrelevant ads, solicitation spam, or engagement bait.</li>
        </ul>
      </section>

      <section className="card stack">
        <h2>Privacy and data expectations</h2>
        <ul className="stack-tight">
          <li>Do not post private personal information without consent.</li>
          <li>Do not share sensitive credentials, tokens, or account access details.</li>
          <li>Report suspicious content instead of escalating arguments publicly.</li>
        </ul>
      </section>

      <section className="card stack">
        <h2>Consequences ladder</h2>
        <ol className="stack-tight">
          <li>Warning or reminder.</li>
          <li>Thread lock or content removal.</li>
          <li>Temporary suspension or ban.</li>
          <li>Permanent ban for severe or repeated abuse.</li>
        </ol>
      </section>

      <section className="card stack">
        <h2>Escalation and official-source boundary</h2>
        <p className="meta">
          Escalation contact:{" "}
          <a href="mailto:peterj.swartz@outlook.com" className="focus-link">
            peterj.swartz@outlook.com
          </a>
        </p>
        <p className="meta">
          This is an unofficial community site. For official notices and governing-source links, use{" "}
          <Link href="/resources" className="focus-link">
            Resources
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
