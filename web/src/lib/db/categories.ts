import { createClient } from "@/lib/supabase/server";

export type ForumCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  created_at: string;
  thread_count: number;
};

export async function listCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, description, created_at, posts:posts(count)")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  type CategoryRow = {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    created_at: string;
    posts: { count: number | null } | { count: number | null }[] | null;
  };

  const rows = (data ?? []) as CategoryRow[];
  const categories = rows.map((row) => {
    const relation = row.posts;
    const relationCount = Array.isArray(relation) ? relation[0]?.count : relation?.count;
    const threadCount = Number.isFinite(relationCount) ? Number(relationCount) : 0;
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      created_at: row.created_at,
      thread_count: threadCount,
    } as ForumCategory;
  });

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
