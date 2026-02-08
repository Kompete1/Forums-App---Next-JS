import { createClient } from "@/lib/supabase/server";
import { toWriteActionError } from "@/lib/db/write-errors";

export type ReportTarget =
  | { targetType: "thread"; threadId: string; replyId?: never }
  | { targetType: "reply"; replyId: string; threadId?: never };

export type ModerationReport = {
  id: string;
  reporter_id: string;
  reporter_display_name: string | null;
  target_type: "thread" | "reply";
  thread_id: string | null;
  reply_id: string | null;
  thread_title: string | null;
  reply_body: string | null;
  reason: string;
  notes: string | null;
  created_at: string;
};

type ReportRow = {
  id: string;
  reporter_id: string;
  target_type: "thread" | "reply";
  thread_id: string | null;
  reply_id: string | null;
  reason: string;
  notes: string | null;
  created_at: string;
  reporter: { display_name: string | null } | { display_name: string | null }[] | null;
  thread: { title: string } | { title: string }[] | null;
  reply: { body: string } | { body: string }[] | null;
};

function normalizeText(value: string) {
  return value.trim();
}

function getSingle<T>(value: T | T[] | null): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function validateReason(reasonInput: string) {
  const reason = normalizeText(reasonInput);

  if (reason.length < 1 || reason.length > 500) {
    throw new Error("Reason must be between 1 and 500 characters.");
  }

  return reason;
}

function validateNotes(notesInput: string) {
  const notes = normalizeText(notesInput);

  if (!notes) {
    return null;
  }

  if (notes.length > 2000) {
    throw new Error("Notes must be 2000 characters or less.");
  }

  return notes;
}

function validateTargetId(value: string, label: "Thread" | "Reply") {
  const id = normalizeText(value);

  if (!id) {
    throw new Error(`${label} ID is required.`);
  }

  return id;
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

export async function createReport(input: { target: ReportTarget; reason: string; notes?: string }) {
  const { supabase, userId } = await requireUserId();
  const reason = validateReason(input.reason);
  const notes = validateNotes(input.notes ?? "");

  const base = {
    reporter_id: userId,
    target_type: input.target.targetType,
    reason,
    notes,
  };

  const payload =
    input.target.targetType === "thread"
      ? { ...base, thread_id: validateTargetId(input.target.threadId, "Thread"), reply_id: null }
      : { ...base, thread_id: null, reply_id: validateTargetId(input.target.replyId, "Reply") };

  const { error } = await supabase.from("reports").insert(payload);

  if (error) {
    throw toWriteActionError(error);
  }
}

export async function listReportsForModeration() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reports")
    .select(
      "id, reporter_id, target_type, thread_id, reply_id, reason, notes, created_at, reporter:reporter_id(display_name), thread:thread_id(title), reply:reply_id(body)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as ReportRow[];
  return rows.map((row) => ({
    id: row.id,
    reporter_id: row.reporter_id,
    reporter_display_name: getSingle(row.reporter)?.display_name ?? null,
    target_type: row.target_type,
    thread_id: row.thread_id,
    reply_id: row.reply_id,
    thread_title: getSingle(row.thread)?.title ?? null,
    reply_body: getSingle(row.reply)?.body ?? null,
    reason: row.reason,
    notes: row.notes,
    created_at: row.created_at,
  })) as ModerationReport[];
}
