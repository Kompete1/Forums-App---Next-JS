"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

function getSafeNextPath(value: string | null) {
  const candidate = value?.trim() ?? "";

  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return null;
  }

  return candidate;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createClient();

    setIsSubmitting(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    const currentUrl = new URL(window.location.href);
    const nextPath = getSafeNextPath(currentUrl.searchParams.get("next")) ?? "/profile";
    const transitionPath = nextPath !== "/profile" ? `/profile?next=${encodeURIComponent(nextPath)}` : "/profile";
    window.location.assign(transitionPath);
  }

  return (
    <main className="page-wrap">
      <section className="auth-wrap card stack">
      <h1>Login</h1>
      <p className="meta">Sign in with your email and password.</p>
      <form onSubmit={handleSignIn} className="stack">
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
          />
        </div>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          Sign in
        </button>
      </form>
      {error ? <p className="thread-status locked">{error}</p> : null}
      <p className="inline-actions">
        <Link href="/auth/signup" className="btn-link focus-link">
          Sign up
        </Link>
        <Link href="/auth/reset" className="btn-link focus-link">
          Reset password
        </Link>
      </p>
      </section>
    </main>
  );
}
