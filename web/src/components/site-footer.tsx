import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer" aria-label="Site governance links">
      <div className="site-footer-inner">
        <nav className="site-footer-nav" aria-label="Community policy">
          <Link href="/community-guidelines" className="focus-link">
            Community Guidelines
          </Link>
          <Link href="/moderation-policy" className="focus-link">
            Moderation
          </Link>
          <Link href="/resources" className="focus-link">
            Resources
          </Link>
        </nav>
        <p className="meta">
          Unofficial community site. Verify schedules, regulations, and official notices via{" "}
          <Link href="/resources" className="focus-link">
            official sources
          </Link>
          .
        </p>
        <p className="meta">
          Escalation contact:{" "}
          <a href="mailto:peterj.swartz@outlook.com" className="focus-link">
            peterj.swartz@outlook.com
          </a>
        </p>
      </div>
    </footer>
  );
}
