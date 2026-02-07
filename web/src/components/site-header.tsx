import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { canCurrentUserModerateThreads } from "@/lib/db/moderation";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const canModerate = user ? await canCurrentUserModerateThreads().catch(() => false) : false;

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-brand">
          SA Racing Forum
        </Link>
        <nav className="site-nav" aria-label="Primary">
          <Link href="/forum">Forum</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/newsletter">Newsletter</Link>
          {canModerate ? <Link href="/moderation/reports">Moderation</Link> : null}
          {user ? <Link href="/profile">Profile</Link> : <Link href="/auth/login">Login</Link>}
        </nav>
      </div>
    </header>
  );
}
