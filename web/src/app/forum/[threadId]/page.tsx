import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getThreadById, updateThread, deleteThread } from "@/lib/db/posts";
import { listCategories } from "@/lib/db/categories";
import { createReply, listRepliesByThreadIds } from "@/lib/db/replies";
import { createReport } from "@/lib/db/reports";
import { canCurrentUserModerateThreads, setThreadLockState } from "@/lib/db/moderation";

export const dynamic = "force-dynamic";

type ThreadDetailPageProps = {
  params: {
    threadId: string;
  };
};

export default async function ThreadDetailPage({ params }: ThreadDetailPageProps) {
  const { threadId } = params;
  const thread = await getThreadById(threadId);

  if (!thread) {
    notFound();
  }

  const threadIdValue = thread.id;
  const backToFeedHref = thread.category_slug ? `/forum/category/${encodeURIComponent(thread.category_slug)}` : "/forum";
  const [categories, repliesMap] = await Promise.all([listCategories(), listRepliesByThreadIds([thread.id])]);
  const replies = repliesMap[thread.id] ?? [];

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
      console.error("updateThreadAction failed", error);
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
      console.error("deleteThreadAction failed", error);
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

    if (!tid) {
      return;
    }

    try {
      await createReply({ threadId: tid, body });
    } catch (error) {
      console.error("createReplyAction failed", error);
    }

    revalidatePath(`/forum/${tid}`);
    revalidatePath("/forum");
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
      console.error("createThreadReportAction failed", error);
    }

    revalidatePath(`/forum/${tid}`);
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
      console.error("createReplyReportAction failed", error);
    }

    revalidatePath(`/forum/${threadIdValue}`);
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
      console.error("lockThreadAction failed", error);
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
      console.error("unlockThreadAction failed", error);
    }

    revalidatePath(`/forum/${tid}`);
    revalidatePath("/forum");
  }

  return (
    <main className="page-wrap stack">
      <section className="inline-actions">
        <Link href={backToFeedHref} className="btn-link focus-link">
          Back to forum
        </Link>
      </section>

      <article className="card stack">
        <div>
          <p className="kicker">{thread.category_name ?? "Forum Thread"}</p>
          <h1>{thread.title}</h1>
        </div>
        <p style={{ whiteSpace: "pre-wrap" }}>{thread.body}</p>
        <p className="meta">
          By {thread.author_display_name ?? thread.author_id} on {new Date(thread.created_at).toLocaleString()}
        </p>
        <p className={thread.is_locked ? "thread-status locked" : "thread-status open"}>
          Status: {thread.is_locked ? "Locked" : "Open"}
        </p>

        {canModerateThreads ? (
          <form action={thread.is_locked ? unlockThreadAction : lockThreadAction}>
            <input type="hidden" name="threadId" value={thread.id} />
            <button type="submit" className="btn btn-secondary">
              {thread.is_locked ? "Unlock thread" : "Lock thread"}
            </button>
          </form>
        ) : null}

        {user ? (
          <form action={createThreadReportAction} className="stack">
            <input type="hidden" name="threadId" value={thread.id} />
            <div className="field">
              <label htmlFor={`report-thread-reason-${thread.id}`}>Report thread reason</label>
              <input
                id={`report-thread-reason-${thread.id}`}
                name="reason"
                type="text"
                required
                minLength={1}
                maxLength={500}
                placeholder="Reason for report"
              />
            </div>
            <div className="field">
              <label htmlFor={`report-thread-notes-${thread.id}`}>Notes (optional)</label>
              <textarea
                id={`report-thread-notes-${thread.id}`}
                name="notes"
                maxLength={2000}
                rows={2}
                placeholder="Extra context"
              />
            </div>
            <button type="submit" className="btn btn-secondary">
              Report thread
            </button>
          </form>
        ) : null}
      </article>

      {isOwner ? (
        <section className="card stack">
          <h2>Edit your thread</h2>
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
        </section>
      ) : null}

      <section className="card stack">
        <h2>Replies</h2>
        {replies.length === 0 ? <p className="empty-note">No replies yet.</p> : null}
        <div className="stack">
          {replies.map((reply) => (
            <article key={reply.id} className="card">
              <p style={{ whiteSpace: "pre-wrap" }}>{reply.body}</p>
              <p className="meta">
                By {reply.author_display_name ?? reply.author_id} on {new Date(reply.created_at).toLocaleString()}
              </p>
              {user ? (
                <form action={createReplyReportAction} className="stack">
                  <input type="hidden" name="replyId" value={reply.id} />
                  <div className="field">
                    <label htmlFor={`report-reply-reason-${reply.id}`}>Report reply reason</label>
                    <input
                      id={`report-reply-reason-${reply.id}`}
                      name="reason"
                      type="text"
                      required
                      minLength={1}
                      maxLength={500}
                      placeholder="Reason for report"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`report-reply-notes-${reply.id}`}>Notes (optional)</label>
                    <textarea
                      id={`report-reply-notes-${reply.id}`}
                      name="notes"
                      maxLength={2000}
                      rows={2}
                      placeholder="Extra context"
                    />
                  </div>
                  <button type="submit" className="btn btn-secondary">
                    Report reply
                  </button>
                </form>
              ) : null}
            </article>
          ))}
        </div>

        {thread.is_locked ? <p className="thread-status locked">Thread is locked.</p> : null}

        {user && !thread.is_locked ? (
          <form action={createReplyAction} className="stack">
            <input type="hidden" name="threadId" value={thread.id} />
            <div className="field">
              <label htmlFor={`reply-${thread.id}`}>Add reply</label>
              <textarea id={`reply-${thread.id}`} name="body" required minLength={1} maxLength={5000} rows={4} />
            </div>
            <button type="submit" className="btn btn-primary">
              Post reply
            </button>
          </form>
        ) : null}
      </section>
    </main>
  );
}
