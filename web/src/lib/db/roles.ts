import { createClient } from "@/lib/supabase/server";

export type AppRole = "admin" | "mod" | "user";

type UserRoleRow = {
  role: AppRole;
};

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, userId: null as string | null };
  }

  return { supabase, userId: user.id };
}

export async function listMyRoles() {
  const { supabase, userId } = await requireUserId();

  if (!userId) {
    return [] as AppRole[];
  }

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as UserRoleRow[]).map((row) => row.role);
}

export async function isCurrentUserAdmin() {
  const roles = await listMyRoles();
  return roles.includes("admin");
}
