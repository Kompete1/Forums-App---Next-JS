import { createClient } from "@/lib/supabase/server";

export type ForumCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  created_at: string;
};

export async function listCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, description, created_at")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const categories = (data ?? []) as ForumCategory[];

  categories.sort((a, b) => {
    if (a.slug === "general-paddock" && b.slug !== "general-paddock") {
      return -1;
    }

    if (b.slug === "general-paddock" && a.slug !== "general-paddock") {
      return 1;
    }

    return a.name.localeCompare(b.name);
  });

  return categories;
}
