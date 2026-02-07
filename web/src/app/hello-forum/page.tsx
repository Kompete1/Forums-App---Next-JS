import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HelloForumPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="page-wrap stack">
      <h1>Hello Forum</h1>
      {user ? (
        <p className="meta">Welcome back, {user.email}.</p>
      ) : (
        <p className="meta">You are browsing as a guest. Please sign in to access protected pages.</p>
      )}
    </main>
  );
}
