import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";

export const ATTACHMENTS_BUCKET = "forum-attachments";
export const MAX_ATTACHMENT_COUNT = 3;
export const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;
const SIGNED_URL_TTL_SECONDS = 60 * 60;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type AttachmentErrorCode =
  | "ATTACHMENTS_TOO_MANY"
  | "ATTACHMENT_INVALID_TYPE"
  | "ATTACHMENT_TOO_LARGE"
  | "ATTACHMENT_UPLOAD_FAILED";

export class AttachmentActionError extends Error {
  code: AttachmentErrorCode;

  constructor(code: AttachmentErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "AttachmentActionError";
  }
}

export type AttachmentView = {
  id: string;
  file_name: string;
  mime_type: string;
  byte_size: number;
  created_at: string;
  url: string;
};

type AttachmentRow = {
  id: string;
  file_name: string;
  mime_type: string;
  byte_size: number;
  storage_path: string;
  created_at: string;
  thread_id: string | null;
  reply_id: string | null;
};

export function getAttachmentFiles(formData: FormData, fieldName: string) {
  return formData.getAll(fieldName).filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

export function validateAttachmentFiles(files: File[]) {
  if (files.length > MAX_ATTACHMENT_COUNT) {
    throw new AttachmentActionError(
      "ATTACHMENTS_TOO_MANY",
      `You can upload at most ${MAX_ATTACHMENT_COUNT} images at a time.`,
    );
  }

  for (const file of files) {
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      throw new AttachmentActionError(
        "ATTACHMENT_INVALID_TYPE",
        "Only JPEG, PNG, WEBP, and GIF images are allowed.",
      );
    }

    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      throw new AttachmentActionError(
        "ATTACHMENT_TOO_LARGE",
        `Each image must be ${Math.floor(MAX_ATTACHMENT_SIZE_BYTES / (1024 * 1024))}MB or smaller.`,
      );
    }
  }
}

export function getAttachmentErrorMessage(code: string) {
  switch (code) {
    case "ATTACHMENTS_TOO_MANY":
      return `You can upload at most ${MAX_ATTACHMENT_COUNT} images at a time.`;
    case "ATTACHMENT_INVALID_TYPE":
      return "Only JPEG, PNG, WEBP, and GIF images are allowed.";
    case "ATTACHMENT_TOO_LARGE":
      return `Each image must be ${Math.floor(MAX_ATTACHMENT_SIZE_BYTES / (1024 * 1024))}MB or smaller.`;
    case "ATTACHMENT_UPLOAD_FAILED":
      return "Image upload failed. Please try again.";
    default:
      return null;
  }
}

function sanitizeFileName(input: string) {
  const normalized = input.trim().replace(/[^a-zA-Z0-9._-]+/g, "-");
  const fallback = normalized || "attachment";
  return fallback.slice(0, 120);
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in.");
  }

  return { supabase, userId: user.id };
}

async function uploadAndInsertAttachment(input: {
  ownerId: string;
  file: File;
  threadId?: string;
  replyId?: string;
}) {
  const { supabase } = await requireUser();
  const id = randomUUID();
  const fileName = sanitizeFileName(input.file.name);
  const storagePath = `${input.ownerId}/${id}/${fileName}`;

  const uploadResult = await supabase.storage.from(ATTACHMENTS_BUCKET).upload(storagePath, input.file, {
    upsert: false,
    contentType: input.file.type,
  });

  if (uploadResult.error) {
    throw new AttachmentActionError("ATTACHMENT_UPLOAD_FAILED", "Image upload failed. Please try again.");
  }

  const insertResult = await supabase.from("attachments").insert({
    id,
    owner_id: input.ownerId,
    thread_id: input.threadId ?? null,
    reply_id: input.replyId ?? null,
    file_name: fileName,
    mime_type: input.file.type,
    byte_size: input.file.size,
    storage_path: storagePath,
  });

  if (insertResult.error) {
    await supabase.storage.from(ATTACHMENTS_BUCKET).remove([storagePath]);
    throw new AttachmentActionError("ATTACHMENT_UPLOAD_FAILED", "Image upload failed. Please try again.");
  }
}

export async function saveThreadAttachments(threadId: string, files: File[]) {
  if (files.length === 0) {
    return;
  }
  validateAttachmentFiles(files);

  const { userId } = await requireUser();
  for (const file of files) {
    await uploadAndInsertAttachment({
      ownerId: userId,
      file,
      threadId,
    });
  }
}

export async function saveReplyAttachments(replyId: string, files: File[]) {
  if (files.length === 0) {
    return;
  }
  validateAttachmentFiles(files);

  const { userId } = await requireUser();
  for (const file of files) {
    await uploadAndInsertAttachment({
      ownerId: userId,
      file,
      replyId,
    });
  }
}

export async function listAttachmentsForThreadAndReplies(input: { threadId: string; replyIds: string[] }) {
  const supabase = await createClient();

  const threadResult = await supabase
    .from("attachments")
    .select("id, file_name, mime_type, byte_size, storage_path, created_at, thread_id, reply_id")
    .eq("thread_id", input.threadId)
    .order("created_at", { ascending: true });

  if (threadResult.error) {
    if (threadResult.error.message.includes("public.attachments")) {
      return {
        threadAttachments: [] as AttachmentView[],
        replyAttachmentsById: {} as Record<string, AttachmentView[]>,
      };
    }
    throw new Error(threadResult.error.message);
  }

  let replyRows: AttachmentRow[] = [];
  if (input.replyIds.length > 0) {
    const replyResult = await supabase
      .from("attachments")
      .select("id, file_name, mime_type, byte_size, storage_path, created_at, thread_id, reply_id")
      .in("reply_id", input.replyIds)
      .order("created_at", { ascending: true });

    if (replyResult.error) {
      throw new Error(replyResult.error.message);
    }
    replyRows = (replyResult.data ?? []) as AttachmentRow[];
  }

  const threadRows = (threadResult.data ?? []) as AttachmentRow[];
  const allRows = [...threadRows, ...replyRows];
  const signedUrlMap: Record<string, string> = {};

  for (const row of allRows) {
    const signed = await supabase.storage.from(ATTACHMENTS_BUCKET).createSignedUrl(row.storage_path, SIGNED_URL_TTL_SECONDS);
    if (!signed.error && signed.data.signedUrl) {
      signedUrlMap[row.id] = signed.data.signedUrl;
    }
  }

  const toView = (rows: AttachmentRow[]) =>
    rows
      .map((row) => ({
        id: row.id,
        file_name: row.file_name,
        mime_type: row.mime_type,
        byte_size: row.byte_size,
        created_at: row.created_at,
        url: signedUrlMap[row.id],
      }))
      .filter((row) => Boolean(row.url)) as AttachmentView[];

  const replyAttachmentsById: Record<string, AttachmentView[]> = {};
  for (const row of replyRows) {
    if (!row.reply_id) {
      continue;
    }
    if (!replyAttachmentsById[row.reply_id]) {
      replyAttachmentsById[row.reply_id] = [];
    }
    const url = signedUrlMap[row.id];
    if (url) {
      replyAttachmentsById[row.reply_id].push({
        id: row.id,
        file_name: row.file_name,
        mime_type: row.mime_type,
        byte_size: row.byte_size,
        created_at: row.created_at,
        url,
      });
    }
  }

  return {
    threadAttachments: toView(threadRows),
    replyAttachmentsById,
  };
}
