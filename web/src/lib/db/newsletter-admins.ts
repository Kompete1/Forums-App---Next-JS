import { createClient } from "@/lib/supabase/server";

export async function isCurrentUserNewsletterAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data, error } = await supabase
    .from("newsletter_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data && data.length > 0);
}
