/* eslint-disable @next/next/no-html-link-for-pages */
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfileByUserId, updateDisplayNameByUserId } from "@/lib/db/profiles";
import { getCurrentUser } from "@/lib/supabase/auth";
import { logServerError } from "@/lib/server/logging";

export const dynamic = "force-dynamic";

type ProfilePageProps = {
  searchParams?: Promise<{
    next?: string | string[];
  }>;
};

function getSafeNextPath(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
  const candidate = raw.trim();

  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//") || candidate.startsWith("/profile")) {
    return null;
  }

  return candidate;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }
  const userId = user.id;

  const nextPath = getSafeNextPath(resolvedSearchParams.next);
  if (nextPath) {
    redirect(nextPath);
  }

  const myProfile = await getProfileByUserId(userId).catch(() => null);

  async function updateDisplayNameAction(formData: FormData) {
    "use server";

    const displayName = String(formData.get("displayName") ?? "");

    try {
      await updateDisplayNameByUserId(userId, displayName);
    } catch (error) {
      logServerError("updateDisplayNameAction", error);
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
          <a href="/forum" className="btn-link focus-link">
            Back to forum
          </a>
        </div>
      </section>
    </main>
  );
}
