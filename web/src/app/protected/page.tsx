import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Protected</h1>
      <p>Signed in as: {user.email}</p>
      <p>
        <Link href="/auth/logout">Logout</Link> | <Link href="/">Home</Link>
      </p>
    </main>
  );
}
