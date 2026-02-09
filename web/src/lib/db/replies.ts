import { createClient } from "@/lib/supabase/server";
import { toWriteActionError } from "@/lib/db/write-errors";

export type ForumReply = {
  id: string;
  thread_id: string;
  author_id: string;
  body: string;
  created_at: string;
  updated_at: string;
  author_display_name: string | null;
};

export type AuthorReplyItem = {
  id: string;
  thread_id: string;
  thread_title: string | null;
  body: string;
  created_at: string;
};

type ReplyRow = {
  id: string;
  thread_id: string;
  author_id: string;
  body: string;
  created_at: string;
  updated_at: string;
  profiles: { display_name: string | null } | { display_name: string | null }[] | null;
};

type ReplyInput = {
  threadId: string;
  body: string;
};

function normalizeText(value: string) {
  return value.trim();
}

function validateReplyBody(value: string) {
  const body = normalizeText(value);

  if (body.length < 1 || body.length > 5000) {
    throw new Error("Reply body must be between 1 and 5000 characters.");
  }

  return body;
}

function toDisplayName(value: ReplyRow["profiles"]) {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value[0]?.display_name ?? null;
  }

  return value.display_name;
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

export async function listRepliesByThreadIds(threadIds: string[]) {
  if (threadIds.length === 0) {
    return {} as Record<string, ForumReply[]>;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("replies")
    .select("id, thread_id, author_id, body, created_at, updated_at, profiles:author_id(display_name)")
    .in("thread_id", threadIds)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as ReplyRow[];
  const result: Record<string, ForumReply[]> = {};

  for (const row of rows) {
    const reply: ForumReply = {
      id: row.id,
      thread_id: row.thread_id,
      author_id: row.author_id,
      body: row.body,
      created_at: row.created_at,
      updated_at: row.updated_at,
      author_display_name: toDisplayName(row.profiles),
    };

    if (!result[row.thread_id]) {
      result[row.thread_id] = [];
    }

    result[row.thread_id].push(reply);
  }

  return result;
}

export async function createReply(input: ReplyInput) {
  const body = validateReplyBody(input.body);
  const threadId = normalizeText(input.threadId);

  if (!threadId) {
    throw new Error("Thread ID is required.");
  }

  const { supabase, userId } = await requireUserId();

  const { data, error } = await supabase
    .from("replies")
    .insert({
      thread_id: threadId,
      author_id: userId,
      body,
    })
    .select("id")
    .single();

  if (error) {
    throw toWriteActionError(error);
  }

  return data.id as string;
}

export async function updateReply(id: string, bodyInput: string) {
  const body = validateReplyBody(bodyInput);
  const replyId = normalizeText(id);

  if (!replyId) {
    throw new Error("Reply ID is required.");
  }

  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("replies")
    .update({ body })
    .eq("id", replyId)
    .eq("author_id", userId)
    .select("id")
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error("Reply not found or not allowed.");
  }
}

export async function deleteReply(id: string) {
  const replyId = normalizeText(id);

  if (!replyId) {
    throw new Error("Reply ID is required.");
  }

  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("replies")
    .delete()
    .eq("id", replyId)
    .eq("author_id", userId)
    .select("id")
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error("Reply not found or not allowed.");
  }
}

export async function listRepliesByAuthor(authorIdInput: string, limitInput = 10) {
  const authorId = normalizeText(authorIdInput);
  if (!authorId) {
    return [] as AuthorReplyItem[];
  }

  const parsedLimit = Number.isFinite(limitInput) ? Math.floor(limitInput) : 10;
  const limit = Math.max(1, Math.min(50, parsedLimit));
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("replies")
    .select("id, thread_id, body, created_at, posts:thread_id(title)")
    .eq("author_id", authorId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  type Row = {
    id: string;
    thread_id: string;
    body: string;
    created_at: string;
    posts: { title: string } | { title: string }[] | null;
  };

  const rows = (data ?? []) as Row[];
  return rows.map((row) => ({
    id: row.id,
    thread_id: row.thread_id,
    thread_title: Array.isArray(row.posts) ? row.posts[0]?.title ?? null : row.posts?.title ?? null,
    body: row.body,
    created_at: row.created_at,
  })) as AuthorReplyItem[];
}
