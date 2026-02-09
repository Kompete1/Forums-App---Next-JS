import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getThreadById, updateThread, deleteThread } from "@/lib/db/posts";
import { listCategories } from "@/lib/db/categories";
import { createReply, listRepliesByThreadIds } from "@/lib/db/replies";
import { createReport } from "@/lib/db/reports";
import { canCurrentUserModerateThreads, setThreadLockState } from "@/lib/db/moderation";
import { normalizeWriteError } from "@/lib/db/write-errors";
import { appendQueryParams, appendWriteErrorCode, getSingleSearchParam, getWriteErrorMessageFromSearchParams } from "@/lib/ui/flash-message";
import {
  AttachmentActionError,
  getAttachmentErrorMessage,
  getAttachmentFiles,
  listAttachmentsForThreadAndReplies,
  saveReplyAttachments,
  validateAttachmentFiles,
} from "@/lib/db/attachments";
import { logServerError } from "@/lib/server/logging";
import { ReportActionDialog } from "@/components/report-action-dialog";
import { ReplyComposer } from "@/components/reply-composer";

export const dynamic = "force-dynamic";

type ThreadDetailPageProps = {
  params: Promise<{
    threadId: string;
  }>;
  searchParams?: Promise<{
    replyErrorCode?: string | string[];
    replyAttachmentErrorCode?: string | string[];
    threadReportErrorCode?: string | string[];
    replyReportErrorCode?: string | string[];
  }>;
};

export default async function ThreadDetailPage({ params, searchParams }: ThreadDetailPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const replyErrorMessage = getWriteErrorMessageFromSearchParams(resolvedSearchParams, "replyErrorCode");
  const replyAttachmentErrorMessage = getAttachmentErrorMessage(getSingleSearchParam(resolvedSearchParams, "replyAttachmentErrorCode"));
  const threadReportErrorMessage = getWriteErrorMessageFromSearchParams(resolvedSearchParams, "threadReportErrorCode");
  const replyReportErrorMessage = getWriteErrorMessageFromSearchParams(resolvedSearchParams, "replyReportErrorCode");
  const { threadId } = resolvedParams;
  const thread = await getThreadById(threadId);

  if (!thread) {
    notFound();
  }

  const threadIdValue = thread.id;
  const backToFeedHref = thread.category_slug ? `/forum/category/${encodeURIComponent(thread.category_slug)}` : "/forum";
  const loginToReplyHref = appendQueryParams("/auth/login", { returnTo: `/forum/${thread.id}#reply-composer` });
  const [categories, repliesMap] = await Promise.all([listCategories(), listRepliesByThreadIds([thread.id])]);
  const replies = repliesMap[thread.id] ?? [];
  const attachments = await listAttachmentsForThreadAndReplies({ threadId: thread.id, replyIds: replies.map((reply) => reply.id) }).catch(
    () => ({
      threadAttachments: [],
      replyAttachmentsById: {} as Record<string, { id: string; file_name: string; url: string }[]>,
    }),
  );

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === thread.author_id;
  const canModerateThreads = user ? await canCurrentUserModerateThreads().catch(() => false) : false;

  async function updateThreadAction(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "");
    const title = String(formData.get("title") ?? "");
    const body = String(formData.get("body") ?? "");
    const categoryId = String(formData.get("categoryId") ?? "");

    if (!id) {
      return;
    }

    try {
      await updateThread(id, { title, body, categoryId });
    } catch (error) {
      logServerError("updateThreadAction", error);
    }

    revalidatePath(`/forum/${id}`);
    revalidatePath("/forum");
    revalidatePath("/");
  }

  async function deleteThreadAction(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "");
    if (!id) {
      return;
    }

    try {
      await deleteThread(id);
    } catch (error) {
      logServerError("deleteThreadAction", error);
      return;
    }

    revalidatePath("/forum");
    revalidatePath("/");
    redirect("/forum");
  }

  async function createReplyAction(formData: FormData) {
    "use server";

    const tid = String(formData.get("threadId") ?? "");
    const body = String(formData.get("body") ?? "");
    const replyAttachments = getAttachmentFiles(formData, "replyAttachments");

    if (!tid) {
      return;
    }

    try {
      validateAttachmentFiles(replyAttachments);
      const replyId = await createReply({ threadId: tid, body });
      await saveReplyAttachments(replyId, replyAttachments);
    } catch (error) {
      if (error instanceof AttachmentActionError) {
        redirect(appendQueryParams(`/forum/${encodeURIComponent(tid)}`, { replyAttachmentErrorCode: error.code }));
      }
      logServerError("createReplyAction", error);
      const normalized = normalizeWriteError(error);
      redirect(appendWriteErrorCode(`/forum/${encodeURIComponent(tid)}`, "replyErrorCode", normalized.code));
    }

    revalidatePath(`/forum/${tid}`);
    revalidatePath("/forum");
    redirect(`/forum/${encodeURIComponent(tid)}`);
  }

  async function createThreadReportAction(formData: FormData) {
    "use server";

    const tid = String(formData.get("threadId") ?? "");
    const reason = String(formData.get("reason") ?? "");
    const notes = String(formData.get("notes") ?? "");

    if (!tid) {
      return;
    }

    try {
      await createReport({
        target: { targetType: "thread", threadId: tid },
        reason,
        notes,
      });
    } catch (error) {
      logServerError("createThreadReportAction", error);
      const normalized = normalizeWriteError(error);
      redirect(appendWriteErrorCode(`/forum/${encodeURIComponent(tid)}`, "threadReportErrorCode", normalized.code));
    }

    revalidatePath(`/forum/${tid}`);
    redirect(`/forum/${encodeURIComponent(tid)}`);
  }

  async function createReplyReportAction(formData: FormData) {
    "use server";

    const replyId = String(formData.get("replyId") ?? "");
    const reason = String(formData.get("reason") ?? "");
    const notes = String(formData.get("notes") ?? "");

    if (!replyId) {
      return;
    }

    try {
      await createReport({
        target: { targetType: "reply", replyId },
        reason,
        notes,
      });
    } catch (error) {
      logServerError("createReplyReportAction", error);
      const normalized = normalizeWriteError(error);
      redirect(appendWriteErrorCode(`/forum/${encodeURIComponent(threadIdValue)}`, "replyReportErrorCode", normalized.code));
    }

    revalidatePath(`/forum/${threadIdValue}`);
    redirect(`/forum/${encodeURIComponent(threadIdValue)}`);
  }

  async function lockThreadAction(formData: FormData) {
    "use server";

    const tid = String(formData.get("threadId") ?? "");
    if (!tid) {
      return;
    }

    try {
      await setThreadLockState(tid, true);
    } catch (error) {
      logServerError("lockThreadAction", error);
    }

    revalidatePath(`/forum/${tid}`);
    revalidatePath("/forum");
  }

  async function unlockThreadAction(formData: FormData) {
    "use server";

    const tid = String(formData.get("threadId") ?? "");
    if (!tid) {
      return;
    }

    try {
      await setThreadLockState(tid, false);
    } catch (error) {
      logServerError("unlockThreadAction", error);
    }

    revalidatePath(`/forum/${tid}`);
    revalidatePath("/forum");
  }

  return (
    <main className="page-wrap stack">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/" className="focus-link">
          Home
        </Link>
        <span className="meta">/</span>
        <Link href="/forum" className="focus-link">
          Forum
        </Link>
        <span className="meta">/</span>
        {thread.category_slug ? (
          <>
            <Link href={backToFeedHref} className="focus-link">
              {thread.category_name ?? "Category"}
            </Link>
            <span className="meta">/</span>
          </>
        ) : null}
        <span className="meta">{thread.title}</span>
      </nav>

      <section className="thread-detail-layout">
        <aside className="thread-side-rail stack">
          <article className="card stack">
            <p className="kicker">{thread.category_name ?? "Forum Thread"}</p>
            <h1>{thread.title}</h1>
            <p className="meta">By {thread.author_display_name ?? thread.author_id}</p>
            <p className="meta">{new Date(thread.created_at).toLocaleString()}</p>
            <p className={`thread-status ${thread.is_locked ? "locked" : "open"}`}>{thread.is_locked ? "Locked" : "Open"}</p>
            <div className="stack-tight">
              <Link href={backToFeedHref} className="btn-link focus-link">
                Back to forum
              </Link>
              <a href="#reply-composer" className="btn-link focus-link">
                Jump to reply
              </a>
            </div>
          </article>

          <article className="card stack">
            <h3>Thread actions</h3>
            <div className="inline-actions">
              {user ? (
                <ReportActionDialog
                  targetId={thread.id}
                  targetType="thread"
                  triggerLabel="Report"
                  dialogTitle="Report thread"
                  dialogDescription="Tell moderators why this thread should be reviewed."
                  errorMessage={threadReportErrorMessage}
                  action={createThreadReportAction}
                />
              ) : (
                <Link href={loginToReplyHref} className="btn-link focus-link">
                  Login to report
                </Link>
              )}
              {canModerateThreads ? (
                <form action={thread.is_locked ? unlockThreadAction : lockThreadAction}>
                  <input type="hidden" name="threadId" value={thread.id} />
                  <button type="submit" className="btn btn-secondary">
                    {thread.is_locked ? "Unlock" : "Lock"}
                  </button>
                </form>
              ) : null}
            </div>
          </article>
        </aside>

        <div className="thread-main-column stack">
          <article className="card stack thread-post-unit">
            <header className="post-unit-head">
              <p className="meta">Thread starter</p>
            </header>
            <div className="thread-body-content" style={{ whiteSpace: "pre-wrap" }}>
              {thread.body}
            </div>
            {attachments.threadAttachments.length > 0 ? (
              <div className="attachments-grid">
                {attachments.threadAttachments.map((attachment) => (
                  <a key={attachment.id} href={attachment.url} target="_blank" rel="noreferrer" className="attachment-card">
                    <Image
                      src={attachment.url}
                      alt={attachment.file_name}
                      className="attachment-image"
                      width={320}
                      height={240}
                      unoptimized
                    />
                    <span className="meta">{attachment.file_name}</span>
                  </a>
                ))}
              </div>
            ) : null}
            {thread.source_newsletter_id ? (
              <p className="meta">
                Source newsletter: {thread.source_newsletter_title ?? "Newsletter topic"} |{" "}
                <Link href="/newsletter" className="btn-link focus-link">
                  Open newsletter feed
                </Link>
              </p>
            ) : null}
          </article>

          <section className="card stack">
            <div className="inline-actions">
              <h2>Replies</h2>
              <p className="meta">{replies.length} total</p>
            </div>
            {replyReportErrorMessage ? <p className="thread-status locked">{replyReportErrorMessage}</p> : null}
            {replies.length === 0 ? <p className="empty-note">No replies yet. Start the discussion below.</p> : null}
            <div className="stack">
              {replies.map((reply) => (
                <article key={reply.id} className="reply-unit">
                  <div className="reply-unit-head">
                    <p className="meta">
                      {reply.author_display_name ?? reply.author_id} • {new Date(reply.created_at).toLocaleString()}
                    </p>
                    {user ? (
                      <ReportActionDialog
                        targetId={reply.id}
                        targetType="reply"
                        triggerLabel="Report"
                        dialogTitle="Report reply"
                        dialogDescription="Tell moderators why this reply should be reviewed."
                        errorMessage={replyReportErrorMessage}
                        action={createReplyReportAction}
                      />
                    ) : null}
                  </div>
                  <p style={{ whiteSpace: "pre-wrap" }}>{reply.body}</p>
                  {(attachments.replyAttachmentsById[reply.id] ?? []).length > 0 ? (
                    <div className="attachments-grid">
                      {(attachments.replyAttachmentsById[reply.id] ?? []).map((attachment) => (
                        <a key={attachment.id} href={attachment.url} target="_blank" rel="noreferrer" className="attachment-card">
                          <Image
                            src={attachment.url}
                            alt={attachment.file_name}
                            className="attachment-image"
                            width={320}
                            height={240}
                            unoptimized
                          />
                          <span className="meta">{attachment.file_name}</span>
                        </a>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          {thread.is_locked ? <p className="thread-status locked">Thread is locked. Replies are disabled.</p> : null}

          {user && !thread.is_locked ? (
            <ReplyComposer
              threadId={thread.id}
              action={createReplyAction}
              attachmentErrorMessage={replyAttachmentErrorMessage}
              errorMessage={replyErrorMessage}
            />
          ) : null}
          {!user && !thread.is_locked ? (
            <Link href={loginToReplyHref} className="btn btn-secondary">
              Login to reply
            </Link>
          ) : null}

          {isOwner ? (
            <details className="card stack manage-thread-panel">
              <summary>Manage thread</summary>
              <form action={updateThreadAction} className="stack">
                <input type="hidden" name="id" value={thread.id} />
                <div className="field">
                  <label htmlFor={`thread-category-${thread.id}`}>Category</label>
                  <select id={`thread-category-${thread.id}`} name="categoryId" defaultValue={thread.category_id} required>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor={`thread-title-${thread.id}`}>Title</label>
                  <input
                    id={`thread-title-${thread.id}`}
                    name="title"
                    type="text"
                    defaultValue={thread.title}
                    required
                    minLength={1}
                    maxLength={120}
                  />
                </div>
                <div className="field">
                  <label htmlFor={`thread-body-${thread.id}`}>Body</label>
                  <textarea
                    id={`thread-body-${thread.id}`}
                    name="body"
                    defaultValue={thread.body}
                    required
                    minLength={1}
                    maxLength={5000}
                    rows={6}
                  />
                </div>
                <div className="inline-actions">
                  <button type="submit" className="btn btn-primary">
                    Update thread
                  </button>
                </div>
              </form>

              <form action={deleteThreadAction}>
                <input type="hidden" name="id" value={thread.id} />
                <button type="submit" className="btn btn-danger">
                  Delete thread
                </button>
              </form>
            </details>
          ) : null}
        </div>
      </section>
    </main>
  );
}
