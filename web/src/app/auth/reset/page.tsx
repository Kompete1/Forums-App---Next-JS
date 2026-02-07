"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

type Mode = "request" | "update";

export default function ResetPasswordPage() {
  const [mode, setMode] = useState<Mode>("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function detectRecoveryFlow() {
      const supabase = createClient();
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const tokenHash = url.searchParams.get("token_hash");
      const type = url.searchParams.get("type");

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
        window.history.replaceState({}, "", "/auth/reset");
        setMode("update");
        return;
      }

      if (tokenHash && type === "recovery") {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });
        if (verifyError) {
          setError(verifyError.message);
          return;
        }
        window.history.replaceState({}, "", "/auth/reset");
        setMode("update");
        return;
      }

      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const hashType = hashParams.get("type");

      if (accessToken && refreshToken && hashType === "recovery") {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) {
          setError(sessionError.message);
          return;
        }
        window.history.replaceState({}, "", "/auth/reset");
        setMode("update");
      }
    }

    void detectRecoveryFlow();
  }, []);

  async function handleRequestReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createClient();

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });

    setIsSubmitting(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage("Password reset email sent. Open the link in your email to continue.");
  }

  async function handleUpdatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createClient();

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setIsSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Password updated. You can now sign in with your new password.");
  }

  return (
    <main className="page-wrap">
      <section className="auth-wrap card stack">
      <h1>Reset password</h1>
      {mode === "request" ? (
        <form onSubmit={handleRequestReset} className="stack">
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
          <button type="submit" disabled={isSubmitting} className="btn btn-primary">
            Send reset email
          </button>
        </form>
      ) : (
        <form onSubmit={handleUpdatePassword} className="stack">
          <div className="field">
            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary">
            Update password
          </button>
        </form>
      )}
      {message ? <p className="meta">{message}</p> : null}
      {error ? <p className="thread-status locked">{error}</p> : null}
      <p className="inline-actions">
        <Link href="/auth/login" className="btn-link focus-link">
          Login
        </Link>
        <Link href="/auth/signup" className="btn-link focus-link">
          Sign up
        </Link>
      </p>
      </section>
    </main>
  );
}
