"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createClient();

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/hello-forum`,
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
      <h1>Sign up</h1>
      <p>Create an account with email and password.</p>
      <form onSubmit={handleSignUp} style={{ display: "grid", gap: "0.75rem" }}>
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
        <button type="submit" disabled={isSubmitting}>
          Sign up
        </button>
      </form>
      {message ? <p>{message}</p> : null}
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
      <p>
        <Link href="/auth/login">Login</Link> | <Link href="/">Home</Link>
      </p>
    </main>
  );
}
