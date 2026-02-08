import { createClient } from "@/lib/supabase/server";

export type MyProfile = {
  id: string;
  email: string;
  display_name: string | null;
};

type DbClient = Awaited<ReturnType<typeof createClient>>;

function normalizeUserId(value: string) {
  const userId = value.trim();

  if (!userId) {
    throw new Error("User ID is required.");
  }

  return userId;
}

function normalizeDisplayName(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.length < 1 || normalized.length > 40) {
    throw new Error("Display name must be between 1 and 40 characters.");
  }

  return normalized;
}

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in.");
  }

  return { supabase, userId: user.id };
}

async function getProfileByUserIdInternal(supabase: DbClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, display_name")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as MyProfile;
}

async function updateDisplayNameByUserIdInternal(supabase: DbClient, userId: string, displayName: string) {
  const normalized = normalizeDisplayName(displayName);

  const { data, error } = await supabase
    .from("profiles")
    .update({ display_name: normalized })
    .eq("id", userId)
    .select("id, email, display_name")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as MyProfile;
}

export async function getProfileByUserId(userIdInput: string) {
  const userId = normalizeUserId(userIdInput);
  const supabase = await createClient();
  return getProfileByUserIdInternal(supabase, userId);
}

export async function updateDisplayNameByUserId(userIdInput: string, displayName: string) {
  const userId = normalizeUserId(userIdInput);
  const supabase = await createClient();
  return updateDisplayNameByUserIdInternal(supabase, userId, displayName);
}

export async function getMyProfile() {
  const { supabase, userId } = await requireUserId();
  return getProfileByUserIdInternal(supabase, userId);
}

export async function updateMyDisplayName(displayName: string) {
  const { supabase, userId } = await requireUserId();
  return updateDisplayNameByUserIdInternal(supabase, userId, displayName);
}
