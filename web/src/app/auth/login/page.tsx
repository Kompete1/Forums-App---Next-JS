"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignIn() {
    const supabase = createClient();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/protected");
    router.refresh();
  }

  async function handleSignUp() {
    const supabase = createClient();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/protected`,
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
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: "32rem" }}>
      <h1>Login</h1>
      <p>Email/password auth with Supabase.</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSignIn();
        }}
        style={{ display: "grid", gap: "0.75rem" }}
      >
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={6}
        />
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button type="submit" disabled={isSubmitting}>
            Sign in
          </button>
          <button type="button" onClick={() => void handleSignUp()} disabled={isSubmitting}>
            Sign up
          </button>
          <Link href="/auth/logout">Logout</Link>
        </div>
      </form>
      {message ? <p>{message}</p> : null}
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
      <p>
        <Link href="/">Home</Link> | <Link href="/protected">Protected</Link>
      </p>
    </main>
  );
}
