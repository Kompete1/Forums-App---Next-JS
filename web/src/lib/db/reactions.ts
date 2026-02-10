import { createClient } from "@/lib/supabase/server";
import { WriteActionError } from "@/lib/db/write-errors";

type ReactionTargetType = "thread" | "reply";

type ReactionRow = {
  id: string;
  author_id: string;
  target_type: ReactionTargetType;
  thread_id: string | null;
  reply_id: string | null;
  kind: "like";
};

type CountRow = {
  thread_id?: string | null;
  reply_id?: string | null;
};

function normalizeText(value: string) {
  return value.trim();
}

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new WriteActionError("REACTION_AUTH_REQUIRED");
  }

  return { supabase, userId: user.id };
}

function isUniqueViolation(error: { code?: string; message?: string } | null) {
  return error?.code === "23505";
}

function isPolicyViolation(error: { code?: string; message?: string } | null) {
  return error?.code === "42501";
}

function isMissingReactionsTable(error: { message?: string } | null) {
  return error?.message?.includes("public.reactions") ?? false;
}

export async function likeThread(threadIdInput: string) {
  const threadId = normalizeText(threadIdInput);
  if (!threadId) {
    throw new Error("Thread ID is required.");
  }

  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("reactions")
    .insert({
      author_id: userId,
      target_type: "thread",
      thread_id: threadId,
      kind: "like",
    })
    .select("id")
    .limit(1);

  if (error) {
    if (isMissingReactionsTable(error)) {
      throw new WriteActionError("REACTION_FEATURE_UNAVAILABLE");
    }
    if (isUniqueViolation(error)) {
      return { alreadyLiked: true };
    }
    if (isPolicyViolation(error)) {
      throw new WriteActionError("REACTION_SELF_LIKE_BLOCKED");
    }
    throw new Error(error.message);
  }

  return { id: data?.[0]?.id ?? null, alreadyLiked: false };
}

export async function likeReply(replyIdInput: string) {
  const replyId = normalizeText(replyIdInput);
  if (!replyId) {
    throw new Error("Reply ID is required.");
  }

  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("reactions")
    .insert({
      author_id: userId,
      target_type: "reply",
      reply_id: replyId,
      kind: "like",
    })
    .select("id")
    .limit(1);

  if (error) {
    if (isMissingReactionsTable(error)) {
      throw new WriteActionError("REACTION_FEATURE_UNAVAILABLE");
    }
    if (isUniqueViolation(error)) {
      return { alreadyLiked: true };
    }
    if (isPolicyViolation(error)) {
      throw new WriteActionError("REACTION_SELF_LIKE_BLOCKED");
    }
    throw new Error(error.message);
  }

  return { id: data?.[0]?.id ?? null, alreadyLiked: false };
}

export async function getThreadLikeCount(threadIdInput: string) {
  const threadId = normalizeText(threadIdInput);
  if (!threadId) {
    return 0;
  }

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("reactions")
    .select("id", { count: "exact", head: true })
    .eq("target_type", "thread")
    .eq("thread_id", threadId)
    .eq("kind", "like");

  if (error) {
    if (isMissingReactionsTable(error)) {
      throw new WriteActionError("REACTION_FEATURE_UNAVAILABLE");
    }
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function getThreadLikeCounts(threadIds: string[]) {
  if (threadIds.length === 0) {
    return {} as Record<string, number>;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reactions")
    .select("thread_id")
    .eq("target_type", "thread")
    .eq("kind", "like")
    .in("thread_id", threadIds);

  if (error) {
    if (isMissingReactionsTable(error)) {
      throw new WriteActionError("REACTION_FEATURE_UNAVAILABLE");
    }
    throw new Error(error.message);
  }

  const rows = (data ?? []) as CountRow[];
  const counts = Object.fromEntries(threadIds.map((threadId) => [threadId, 0])) as Record<string, number>;
  for (const row of rows) {
    const threadId = row.thread_id ?? "";
    if (!threadId) {
      continue;
    }
    counts[threadId] = (counts[threadId] ?? 0) + 1;
  }

  return counts;
}

export async function getReplyLikeCounts(replyIds: string[]) {
  if (replyIds.length === 0) {
    return {} as Record<string, number>;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reactions")
    .select("reply_id")
    .eq("target_type", "reply")
    .eq("kind", "like")
    .in("reply_id", replyIds);

  if (error) {
    if (isMissingReactionsTable(error)) {
      throw new WriteActionError("REACTION_FEATURE_UNAVAILABLE");
    }
    throw new Error(error.message);
  }

  const rows = (data ?? []) as CountRow[];
  const counts = Object.fromEntries(replyIds.map((replyId) => [replyId, 0])) as Record<string, number>;
  for (const row of rows) {
    const replyId = row.reply_id ?? "";
    if (!replyId) {
      continue;
    }
    counts[replyId] = (counts[replyId] ?? 0) + 1;
  }

  return counts;
}

export async function getMyLikedTargets(input: { threadId: string; replyIds: string[] }) {
  const threadId = normalizeText(input.threadId);
  const replyIds = input.replyIds;

  const { supabase, userId } = await requireUserId();

  let threadLiked = false;
  if (threadId) {
    const { data, error } = await supabase
      .from("reactions")
      .select("id")
      .eq("author_id", userId)
      .eq("target_type", "thread")
      .eq("kind", "like")
      .eq("thread_id", threadId)
      .limit(1);

    if (error) {
      if (isMissingReactionsTable(error)) {
        throw new WriteActionError("REACTION_FEATURE_UNAVAILABLE");
      }
      throw new Error(error.message);
    }
    threadLiked = Boolean(data?.[0]?.id);
  }

  let replyLikedById = {} as Record<string, boolean>;
  if (replyIds.length > 0) {
    const { data, error } = await supabase
      .from("reactions")
      .select("reply_id")
      .eq("author_id", userId)
      .eq("target_type", "reply")
      .eq("kind", "like")
      .in("reply_id", replyIds);

    if (error) {
      if (isMissingReactionsTable(error)) {
        throw new WriteActionError("REACTION_FEATURE_UNAVAILABLE");
      }
      throw new Error(error.message);
    }

    const rows = (data ?? []) as ReactionRow[];
    replyLikedById = Object.fromEntries(replyIds.map((replyId) => [replyId, false])) as Record<string, boolean>;
    for (const row of rows) {
      const replyId = row.reply_id ?? "";
      if (replyId) {
        replyLikedById[replyId] = true;
      }
    }
  }

  return {
    threadLiked,
    replyLikedById,
  };
}
