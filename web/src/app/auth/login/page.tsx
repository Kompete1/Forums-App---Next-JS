import Link from "next/link";
import { redirect } from "next/navigation";
import { appendQueryParams, getSingleSearchParam } from "@/lib/ui/flash-message";
import { createClient } from "@/lib/supabase/server";
import { getSafeInternalPath, getSafeReturnToPath } from "@/lib/ui/auth-return-to";

type LoginPageProps = {
  searchParams?: Promise<{
    returnTo?: string | string[];
    next?: string | string[];
    error?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedParams = (await searchParams) ?? {};
  const returnToPath = getSafeReturnToPath({
    returnTo: getSingleSearchParam(resolvedParams, "returnTo"),
    next: getSingleSearchParam(resolvedParams, "next"),
  });
  const errorMessage = getSingleSearchParam(resolvedParams, "error");

  async function signInAction(formData: FormData) {
    "use server";

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const requestedReturnToPath = getSafeInternalPath(String(formData.get("returnTo") ?? ""));
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      redirect(
        appendQueryParams("/auth/login", {
          returnTo: requestedReturnToPath,
          error: error.message,
        }),
      );
    }

    redirect(requestedReturnToPath ?? "/forum");
  }

  return (
    <main className="page-wrap">
      <section className="auth-wrap card stack">
      <h1>Login</h1>
      <p className="meta">Sign in with your email and password.</p>
      <form action={signInAction} className="stack">
        <input type="hidden" name="returnTo" value={returnToPath ?? ""} />
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
          />
        </div>
        <button type="submit" className="btn btn-primary">
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
