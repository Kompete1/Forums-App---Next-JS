import { createClient } from "@/lib/supabase/server";
import { toWriteActionError } from "@/lib/db/write-errors";

export type ForumThread = {
  id: string;
  author_id: string;
  title: string;
  body: string;
  category_id: string;
  source_newsletter_id: string | null;
  source_newsletter_title: string | null;
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
  source_newsletter_id?: string | null;
  is_locked: boolean;
  locked_at: string | null;
  locked_by: string | null;
  created_at: string;
  updated_at: string;
  profiles: { display_name: string | null } | { display_name: string | null }[] | null;
  categories: { slug: string; name: string } | { slug: string; name: string }[] | null;
  newsletters?: { title: string } | { title: string }[] | null;
};

type ThreadInput = {
  title: string;
  body: string;
  categoryId: string;
  sourceNewsletterId?: string;
};

export type ThreadSort = "newest" | "oldest";

export type ListThreadsParams = {
  categoryId?: string;
  newsletterId?: string;
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

function toNewsletterTitle(value: ThreadRow["newsletters"]) {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value[0]?.title ?? null;
  }

  return value.title;
}

function validateThreadInput(input: ThreadInput) {
  const title = normalizeText(input.title);
  const body = normalizeText(input.body);
  const categoryId = normalizeText(input.categoryId);
  const sourceNewsletterId = normalizeText(input.sourceNewsletterId ?? "");

  if (title.length < 1 || title.length > 120) {
    throw new Error("Title must be between 1 and 120 characters.");
  }

  if (body.length < 1 || body.length > 5000) {
    throw new Error("Body must be between 1 and 5000 characters.");
  }

  if (!categoryId) {
    throw new Error("Category is required.");
  }

  return { title, body, categoryId, sourceNewsletterId: sourceNewsletterId || null };
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
  const newsletterId = normalizeText(params.newsletterId ?? "");
  const query = normalizeText(params.query ?? "");
  const sort = params.sort === "oldest" ? "oldest" : "newest";
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();
  const selectWithNewsletter =
    "id, author_id, title, body, category_id, source_newsletter_id, is_locked, locked_at, locked_by, created_at, updated_at, profiles:author_id(display_name), categories:category_id(slug, name), newsletters:source_newsletter_id(title)";
  const selectLegacy =
    "id, author_id, title, body, category_id, is_locked, locked_at, locked_by, created_at, updated_at, profiles:author_id(display_name), categories:category_id(slug, name)";

  let request = supabase
    .from("posts")
    .select(selectWithNewsletter, { count: "exact" })
    .order("created_at", { ascending: sort === "oldest" })
    .range(from, to);
  if (categoryId) {
    request = request.eq("category_id", categoryId);
  }
  if (newsletterId) {
    request = request.eq("source_newsletter_id", newsletterId);
  }
  if (query) {
    request = request.or(`title.ilike.%${query}%,body.ilike.%${query}%`);
  }

  const primary = await request;
  let data = (primary.data ?? null) as ThreadRow[] | null;
  let error = primary.error;
  let count = primary.count;
  const missingNewsletterColumn =
    error?.message.includes("source_newsletter_id") || error?.message.includes("schema cache");
  if (error && missingNewsletterColumn && !newsletterId) {
    let fallbackRequest = supabase
      .from("posts")
      .select(selectLegacy, { count: "exact" })
      .order("created_at", { ascending: sort === "oldest" })
      .range(from, to);
    if (categoryId) {
      fallbackRequest = fallbackRequest.eq("category_id", categoryId);
    }
    if (query) {
      fallbackRequest = fallbackRequest.or(`title.ilike.%${query}%,body.ilike.%${query}%`);
    }
    const fallback = await fallbackRequest;
    data = (fallback.data ?? null) as ThreadRow[] | null;
    error = fallback.error;
    count = fallback.count;
  }

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  const threads = rows.map((row) => {
    const category = toCategory(row.categories);

    return {
      id: row.id,
      author_id: row.author_id,
      title: row.title,
      body: row.body,
      category_id: row.category_id,
      source_newsletter_id: row.source_newsletter_id ?? null,
      source_newsletter_title: toNewsletterTitle(row.newsletters),
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
  const selectWithNewsletter =
    "id, author_id, title, body, category_id, source_newsletter_id, is_locked, locked_at, locked_by, created_at, updated_at, profiles:author_id(display_name), categories:category_id(slug, name), newsletters:source_newsletter_id(title)";
  const selectLegacy =
    "id, author_id, title, body, category_id, is_locked, locked_at, locked_by, created_at, updated_at, profiles:author_id(display_name), categories:category_id(slug, name)";

  const primary = await supabase.from("posts").select(selectWithNewsletter).eq("id", threadId).limit(1).maybeSingle();
  let data = (primary.data ?? null) as ThreadRow | null;
  let error = primary.error;
  const missingNewsletterColumn =
    error?.message.includes("source_newsletter_id") || error?.message.includes("schema cache");
  if (error && missingNewsletterColumn) {
    const fallback = await supabase.from("posts").select(selectLegacy).eq("id", threadId).limit(1).maybeSingle();
    data = (fallback.data ?? null) as ThreadRow | null;
    error = fallback.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data;
  const category = toCategory(row.categories);

  return {
    id: row.id,
    author_id: row.author_id,
    title: row.title,
    body: row.body,
    category_id: row.category_id,
    source_newsletter_id: row.source_newsletter_id ?? null,
    source_newsletter_title: toNewsletterTitle(row.newsletters),
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
  const { title, body, categoryId, sourceNewsletterId } = validateThreadInput(input);
  const { supabase, userId } = await requireUserId();

  const insertPayload: {
    author_id: string;
    category_id: string;
    title: string;
    body: string;
    source_newsletter_id?: string;
  } = {
    author_id: userId,
    category_id: categoryId,
    title,
    body,
  };
  if (sourceNewsletterId) {
    insertPayload.source_newsletter_id = sourceNewsletterId;
  }

  const { data, error } = await supabase
    .from("posts")
    .insert(insertPayload)
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
