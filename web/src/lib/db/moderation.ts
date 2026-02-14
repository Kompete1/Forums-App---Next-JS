import { createClient } from "@/lib/supabase/server";
import { listMyRoles } from "@/lib/db/roles";

function normalizeId(value: string) {
  return value.trim();
}

export async function canCurrentUserModerateThreads() {
  const roles = await listMyRoles();
  return roles.includes("admin") || roles.includes("mod");
}

export async function setThreadLockState(threadIdInput: string, isLocked: boolean) {
  const threadId = normalizeId(threadIdInput);

  if (!threadId) {
    throw new Error("Thread ID is required.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in.");
  }

  const payload = isLocked
    ? {
        is_locked: true,
        locked_at: new Date().toISOString(),
        locked_by: user.id,
      }
    : {
        is_locked: false,
        locked_at: null,
        locked_by: null,
      };

  const { data, error } = await supabase
    .from("posts")
    .update(payload)
    .eq("id", threadId)
    .select("id")
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error("Thread not found or not allowed.");
  }
}

export async function setThreadPinState(threadIdInput: string, isPinned: boolean) {
  const threadId = normalizeId(threadIdInput);

  if (!threadId) {
    throw new Error("Thread ID is required.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in.");
  }

  const payload = isPinned
    ? {
        is_pinned: true,
        pinned_at: new Date().toISOString(),
        pinned_by: user.id,
      }
    : {
        is_pinned: false,
        pinned_at: null,
        pinned_by: null,
      };

  const { data, error } = await supabase
    .from("posts")
    .update(payload)
    .eq("id", threadId)
    .select("id")
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error("Thread not found or not allowed.");
  }
}
