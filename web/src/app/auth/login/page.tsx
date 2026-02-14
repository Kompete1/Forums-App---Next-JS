"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSafeReturnToPath } from "@/lib/ui/auth-return-to";
import { createClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="page-wrap"><section className="auth-wrap card stack"><h1>Login</h1></section></main>}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(searchParams.get("error"));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const returnToPath = useMemo(
    () =>
      getSafeReturnToPath({
        returnTo: searchParams.get("returnTo") ?? undefined,
        next: searchParams.get("next") ?? undefined,
      }),
    [searchParams],
  );

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    router.replace(returnToPath ?? "/forum");
    router.refresh();
  }

  return (
    <main className="page-wrap">
      <section className="auth-wrap card stack">
        <h1>Login</h1>
        <p className="meta">Sign in with your email and password.</p>
        <form onSubmit={handleSignIn} className="stack">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            Sign in
          </button>
        </form>
        {errorMessage ? <p className="thread-status locked">{errorMessage}</p> : null}
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
