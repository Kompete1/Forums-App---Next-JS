import { createClient } from "@/lib/supabase/server";

export type NotificationKind = "reply_received" | "thread_reported" | "report_status_changed";

export type ForumNotification = {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  actor_display_name: string | null;
  kind: NotificationKind;
  thread_id: string | null;
  reply_id: string | null;
  report_id: string | null;
  payload: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
};

type NotificationRow = {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  kind: NotificationKind;
  thread_id: string | null;
  reply_id: string | null;
  report_id: string | null;
  payload: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  actor: { display_name: string | null } | { display_name: string | null }[] | null;
};

export type ListMyNotificationsParams = {
  page?: number;
  pageSize?: number;
};

export type ListMyNotificationsPage = {
  notifications: ForumNotification[];
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

function getSingle<T>(value: T | T[] | null): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in.");
  }

  return { supabase, user };
}

export async function getUnreadNotificationCount() {
  const { supabase, user } = await requireUser();

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { head: true, count: "exact" })
    .eq("recipient_id", user.id)
    .eq("is_read", false);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function listMyNotifications(params: ListMyNotificationsParams = {}) {
  const pageSize = normalizePositiveInt(params.pageSize, 20, 100);
  const page = normalizePositiveInt(params.page, 1, 10000);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { supabase, user } = await requireUser();

  const { data, error, count } = await supabase
    .from("notifications")
    .select(
      "id, recipient_id, actor_id, kind, thread_id, reply_id, report_id, payload, is_read, created_at, read_at, actor:actor_id(display_name)",
      { count: "exact" },
    )
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as NotificationRow[];
  const notifications = rows.map((row) => ({
    id: row.id,
    recipient_id: row.recipient_id,
    actor_id: row.actor_id,
    actor_display_name: getSingle(row.actor)?.display_name ?? null,
    kind: row.kind,
    thread_id: row.thread_id,
    reply_id: row.reply_id,
    report_id: row.report_id,
    payload: row.payload ?? {},
    is_read: row.is_read,
    created_at: row.created_at,
    read_at: row.read_at,
  })) as ForumNotification[];

  return {
    notifications,
    total: count ?? 0,
    page,
    pageSize,
  } as ListMyNotificationsPage;
}

export async function markNotificationRead(notificationIdInput: string) {
  const notificationId = normalizeText(notificationIdInput);

  if (!notificationId) {
    throw new Error("Notification ID is required.");
  }

  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("recipient_id", user.id)
    .eq("is_read", false)
    .select("id")
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return data?.[0]?.id ?? null;
}

export async function markAllNotificationsRead() {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("recipient_id", user.id)
    .eq("is_read", false);

  if (error) {
    throw new Error(error.message);
  }
}
