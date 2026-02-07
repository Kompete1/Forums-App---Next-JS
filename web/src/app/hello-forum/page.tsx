import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HelloForumPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Hello Forum</h1>
      {user ? (
        <p>Welcome back, {user.email}.</p>
      ) : (
        <p>You are browsing as a guest. Please sign in to access protected pages.</p>
      )}
      <p>
        <Link href="/auth/login">Login</Link> | <Link href="/auth/signup">Sign up</Link> |{" "}
        <Link href="/protected">Protected</Link> | <Link href="/auth/logout">Logout</Link>
      </p>
    </main>
  );
}
