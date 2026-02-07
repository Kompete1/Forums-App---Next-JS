import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyProfile, updateMyDisplayName } from "@/lib/db/profiles";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const myProfile = await getMyProfile().catch(() => null);

  async function updateDisplayNameAction(formData: FormData) {
    "use server";

    const displayName = String(formData.get("displayName") ?? "");

    try {
      await updateMyDisplayName(displayName);
    } catch (error) {
      console.error("updateDisplayNameAction failed", error);
    }

    revalidatePath("/profile");
  }

  return (
    <main className="page-wrap stack">
      <section>
        <p className="kicker">Account</p>
        <h1>Profile</h1>
        <p className="meta">Signed in as {user.email}</p>
      </section>

      <section className="card stack">
        <h2>Display name</h2>
        <p className="meta">
          Current display name: <strong>{myProfile?.display_name ?? "(not set)"}</strong>
        </p>
        <form action={updateDisplayNameAction} className="field" style={{ maxWidth: "24rem" }}>
          <label htmlFor="displayName">Display name</label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            defaultValue={myProfile?.display_name ?? ""}
            placeholder="Enter display name"
            maxLength={40}
          />
          <button type="submit" className="btn btn-primary">
            Save display name
          </button>
        </form>
      </section>

      <section className="card stack">
        <h2>Session</h2>
        <div className="inline-actions">
          <Link href="/auth/logout" className="btn btn-secondary">
            Logout
          </Link>
          <Link href="/forum" className="btn-link focus-link">
            Back to forum
          </Link>
        </div>
      </section>
    </main>
  );
}
