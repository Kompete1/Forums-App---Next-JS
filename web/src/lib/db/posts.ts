import { createClient } from "@/lib/supabase/server";
import { toWriteActionError } from "@/lib/db/write-errors";

export type ForumThread = {
  id: string;
  author_id: string;
  title: string;
  body: string;
  category_id: string;
  is_locked: boolean;
  locked_at: string | null;
  locked_by: string | null;
  created_at: string;
  updated_at: string;
  author_display_name: string | null;
  category_slug: string | null;
  category_name: string | null;
};

type ThreadRow = {
  id: string;
  author_id: string;
  title: string;
  body: string;
  category_id: string;
  is_locked: boolean;
  locked_at: string | null;
  locked_by: string | null;
  created_at: string;
  updated_at: string;
  profiles: { display_name: string | null } | { display_name: string | null }[] | null;
  categories: { slug: string; name: string } | { slug: string; name: string }[] | null;
};

type ThreadInput = {
  title: string;
  body: string;
  categoryId: string;
};

export type ThreadSort = "newest" | "oldest";

export type ListThreadsParams = {
  categoryId?: string;
  query?: string;
  sort?: ThreadSort;
  page?: number;
  pageSize?: number;
};

export type ListThreadsPage = {
  threads: ForumThread[];
  total: number;
  page: number;
  pageSize: number;
};

function normalizeText(value: string) {
  return value.trim();
}

function normalizePositiveInt(value: number | undefined, fallback: number, max: number) {
  if (!value || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.min(max, Math.floor(value)));
}

function toDisplayName(value: ThreadRow["profiles"]) {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value[0]?.display_name ?? null;
  }

  return value.display_name;
}

function toCategory(value: ThreadRow["categories"]) {
  if (!value) {
    return { slug: null, name: null };
  }

  if (Array.isArray(value)) {
    return {
      slug: value[0]?.slug ?? null,
      name: value[0]?.name ?? null,
    };
  }

  return {
    slug: value.slug,
    name: value.name,
  };
}

function validateThreadInput(input: ThreadInput) {
  const title = normalizeText(input.title);
  const body = normalizeText(input.body);
  const categoryId = normalizeText(input.categoryId);

  if (title.length < 1 || title.length > 120) {
    throw new Error("Title must be between 1 and 120 characters.");
  }

  if (body.length < 1 || body.length > 5000) {
    throw new Error("Body must be between 1 and 5000 characters.");
  }

  if (!categoryId) {
    throw new Error("Category is required.");
  }

  return { title, body, categoryId };
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

export async function listThreads() {
  const result = await listThreadsPage();
  return result.threads;
}

export async function listThreadsPage(params: ListThreadsParams = {}) {
  const pageSize = normalizePositiveInt(params.pageSize, 10, 30);
  const page = normalizePositiveInt(params.page, 1, 10000);
  const categoryId = normalizeText(params.categoryId ?? "");
  const query = normalizeText(params.query ?? "");
  const sort = params.sort === "oldest" ? "oldest" : "newest";
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();
  let request = supabase
    .from("posts")
    .select(
      "id, author_id, title, body, category_id, is_locked, locked_at, locked_by, created_at, updated_at, profiles:author_id(display_name), categories:category_id(slug, name)",
      { count: "exact" },
    )
    .order("created_at", { ascending: sort === "oldest" })
    .range(from, to);

  if (categoryId) {
    request = request.eq("category_id", categoryId);
  }

  if (query) {
    request = request.or(`title.ilike.%${query}%,body.ilike.%${query}%`);
  }

  const { data, error, count } = await request;

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as ThreadRow[];
  const threads = rows.map((row) => {
    const category = toCategory(row.categories);

    return {
      id: row.id,
      author_id: row.author_id,
      title: row.title,
      body: row.body,
      category_id: row.category_id,
      is_locked: row.is_locked,
      locked_at: row.locked_at,
      locked_by: row.locked_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
      author_display_name: toDisplayName(row.profiles),
      category_slug: category.slug,
      category_name: category.name,
    } as ForumThread;
  });

  return {
    threads,
    total: count ?? 0,
    page,
    pageSize,
  } as ListThreadsPage;
}

export async function getThreadById(id: string) {
  const threadId = normalizeText(id);

  if (!threadId) {
    throw new Error("Thread ID is required.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, author_id, title, body, category_id, is_locked, locked_at, locked_by, created_at, updated_at, profiles:author_id(display_name), categories:category_id(slug, name)",
    )
    .eq("id", threadId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as ThreadRow;
  const category = toCategory(row.categories);

  return {
    id: row.id,
    author_id: row.author_id,
    title: row.title,
    body: row.body,
    category_id: row.category_id,
    is_locked: row.is_locked,
    locked_at: row.locked_at,
    locked_by: row.locked_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author_display_name: toDisplayName(row.profiles),
    category_slug: category.slug,
    category_name: category.name,
  } as ForumThread;
}

export async function createThread(input: ThreadInput) {
  const { title, body, categoryId } = validateThreadInput(input);
  const { supabase, userId } = await requireUserId();

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: userId,
      category_id: categoryId,
      title,
      body,
    })
    .select("id")
    .single();

  if (error) {
    throw toWriteActionError(error);
  }

  return data.id as string;
}

export async function updateThread(id: string, input: ThreadInput) {
  const threadId = normalizeText(id);

  if (!threadId) {
    throw new Error("Thread ID is required.");
  }

  const { title, body, categoryId } = validateThreadInput(input);
  const { supabase, userId } = await requireUserId();

  const { data, error } = await supabase
    .from("posts")
    .update({ title, body, category_id: categoryId })
    .eq("id", threadId)
    .eq("author_id", userId)
    .select("id")
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error("Thread not found or not allowed.");
  }
}

export async function deleteThread(id: string) {
  const threadId = normalizeText(id);

  if (!threadId) {
    throw new Error("Thread ID is required.");
  }

  const { supabase, userId } = await requireUserId();

  const { data, error } = await supabase
    .from("posts")
    .delete()
    .eq("id", threadId)
    .eq("author_id", userId)
    .select("id")
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error("Thread not found or not allowed.");
  }
}

// Compatibility aliases for earlier naming.
export { createThread as createPost, deleteThread as deletePost, listThreads as listPosts, updateThread as updatePost };
