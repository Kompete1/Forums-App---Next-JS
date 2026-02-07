import { createClient } from "@/lib/supabase/server";

export type ForumPost = {
  id: string;
  author_id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
};

type PostInput = {
  title: string;
  body: string;
};

function normalizeText(value: string) {
  return value.trim();
}

function validatePostInput(input: PostInput) {
  const title = normalizeText(input.title);
  const body = normalizeText(input.body);

  if (title.length < 1 || title.length > 120) {
    throw new Error("Title must be between 1 and 120 characters.");
  }

  if (body.length < 1 || body.length > 5000) {
    throw new Error("Body must be between 1 and 5000 characters.");
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

export async function listPosts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, author_id, title, body, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ForumPost[];
}

export async function createPost(input: PostInput) {
  const { title, body } = validatePostInput(input);
  const { supabase, userId } = await requireUserId();

  const { error } = await supabase.from("posts").insert({
    author_id: userId,
    title,
    body,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updatePost(id: string, input: PostInput) {
  const { title, body } = validatePostInput(input);
  const { supabase, userId } = await requireUserId();

  const { data, error } = await supabase
    .from("posts")
    .update({ title, body })
    .eq("id", id)
    .eq("author_id", userId)
    .select("id")
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error("Post not found or not allowed.");
  }
}

export async function deletePost(id: string) {
  const { supabase, userId } = await requireUserId();

  const { data, error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id)
    .eq("author_id", userId)
    .select("id")
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error("Post not found or not allowed.");
  }
}
