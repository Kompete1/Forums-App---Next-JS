import { createClient } from "@/lib/supabase/server";

export type Newsletter = {
  id: string;
  author_id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
  author_display_name: string | null;
};

type NewsletterRow = {
  id: string;
  author_id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
  profiles: { display_name: string | null } | { display_name: string | null }[] | null;
};

function normalizeText(value: string) {
  return value.trim();
}

function toDisplayName(value: NewsletterRow["profiles"]) {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value[0]?.display_name ?? null;
  }

  return value.display_name;
}

function validateNewsletterInput(titleInput: string, bodyInput: string) {
  const title = normalizeText(titleInput);
  const body = normalizeText(bodyInput);

  if (title.length < 1 || title.length > 160) {
    throw new Error("Title must be between 1 and 160 characters.");
  }

  if (body.length < 1 || body.length > 12000) {
    throw new Error("Body must be between 1 and 12000 characters.");
  }

  return { title, body };
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

export async function listNewsletters() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("newsletters")
    .select("id, author_id, title, body, created_at, updated_at, profiles:author_id(display_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as NewsletterRow[];

  return rows.map((row) => ({
    id: row.id,
    author_id: row.author_id,
    title: row.title,
    body: row.body,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author_display_name: toDisplayName(row.profiles),
  })) as Newsletter[];
}

export async function getNewsletterById(id: string) {
  const newsletterId = normalizeText(id);
  if (!newsletterId) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("newsletters")
    .select("id, author_id, title, body, created_at, updated_at, profiles:author_id(display_name)")
    .eq("id", newsletterId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as NewsletterRow;
  return {
    id: row.id,
    author_id: row.author_id,
    title: row.title,
    body: row.body,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author_display_name: toDisplayName(row.profiles),
  } as Newsletter;
}

export async function createNewsletter(input: { title: string; body: string }) {
  const { title, body } = validateNewsletterInput(input.title, input.body);
  const { supabase, userId } = await requireUserId();

  const { error } = await supabase.from("newsletters").insert({
    author_id: userId,
    title,
    body,
  });

  if (error) {
    throw new Error(error.message);
  }
}
