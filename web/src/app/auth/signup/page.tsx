"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createClient();

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const normalizedDisplayName = displayName.trim();

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/hello-forum`,
        data: normalizedDisplayName ? { display_name: normalizedDisplayName } : undefined,
      },
    });

    setIsSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setMessage("Sign-up request submitted. Check your inbox if email confirmation is enabled.");
  }

  return (
    <main className="page-wrap">
      <section className="auth-wrap card stack">
      <h1>Sign up</h1>
      <p className="meta">Create an account with email and password.</p>
      <form onSubmit={handleSignUp} className="stack">
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
        <div className="field">
          <label htmlFor="displayName">Display name (optional)</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={40}
          />
        </div>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          Sign up
        </button>
      </form>
      {message ? <p className="meta">{message}</p> : null}
      {error ? <p className="thread-status locked">{error}</p> : null}
      <p className="inline-actions">
        <Link href="/auth/login" className="btn-link focus-link">
          Login
        </Link>
        <Link href="/" className="btn-link focus-link">
          Home
        </Link>
      </p>
      </section>
    </main>
  );
}
