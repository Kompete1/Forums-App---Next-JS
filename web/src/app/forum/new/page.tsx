import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listCategories } from "@/lib/db/categories";
import { createThread } from "@/lib/db/posts";
import { getNewsletterById } from "@/lib/db/newsletters";
import { normalizeWriteError } from "@/lib/db/write-errors";
import {
  AttachmentActionError,
  getAttachmentErrorMessage,
  getAttachmentFiles,
  saveThreadAttachments,
  validateAttachmentFiles,
} from "@/lib/db/attachments";
import { appendQueryParams, getSingleSearchParam, getWriteErrorMessageFromSearchParams } from "@/lib/ui/flash-message";
import { CreateThreadForm } from "@/components/create-thread-form";

export const dynamic = "force-dynamic";

type NewThreadPageProps = {
  searchParams?: Promise<{
    category?: string | string[];
    fromNewsletter?: string | string[];
    errorCode?: string | string[];
    attachmentErrorCode?: string | string[];
  }>;
};

export default async function NewThreadPage({ searchParams }: NewThreadPageProps) {
  const resolvedParams = (await searchParams) ?? {};
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const categories = await listCategories();
  const requestedSlug = getSingleSearchParam(resolvedParams, "category");
  const fromNewsletterId = getSingleSearchParam(resolvedParams, "fromNewsletter");
  const sourceNewsletter = fromNewsletterId ? await getNewsletterById(fromNewsletterId).catch(() => null) : null;
  const submitErrorMessage = getWriteErrorMessageFromSearchParams(resolvedParams, "errorCode");
  const attachmentErrorMessage = getAttachmentErrorMessage(getSingleSearchParam(resolvedParams, "attachmentErrorCode"));
  const fallbackCategorySlug = sourceNewsletter ? "general-paddock" : requestedSlug;
  const selectedCategory =
    categories.find((category) => category.slug === fallbackCategorySlug) ??
    categories.find((category) => category.slug === "general-paddock") ??
    categories[0] ??
    null;
  const defaultCategoryId = selectedCategory?.id ?? "";
  const defaultTitle = sourceNewsletter ? `Discussion: ${sourceNewsletter.title}` : "";
  const defaultBody = sourceNewsletter
    ? `Sharing this newsletter topic for discussion:\n\n${sourceNewsletter.title}\n\n${sourceNewsletter.body}`
    : "";

  async function createThreadAction(formData: FormData) {
    "use server";

    const title = String(formData.get("title") ?? "");
    const body = String(formData.get("body") ?? "");
    const categoryId = String(formData.get("categoryId") ?? "");
    const sourceNewsletterId = String(formData.get("sourceNewsletterId") ?? "");
    const attachments = getAttachmentFiles(formData, "attachments");
    const category = categories.find((item) => item.id === categoryId) ?? null;

    try {
      validateAttachmentFiles(attachments);
    } catch (error) {
      if (error instanceof AttachmentActionError) {
        const fallbackSlug = category?.slug ?? selectedCategory?.slug ?? "general-paddock";
        redirect(
          appendQueryParams("/forum/new", {
            category: fallbackSlug,
            fromNewsletter: sourceNewsletter?.id ?? null,
            attachmentErrorCode: error.code,
          }),
        );
      }
    }

    let newThreadId = "";
    try {
      newThreadId = await createThread({ title, body, categoryId, sourceNewsletterId });
      await saveThreadAttachments(newThreadId, attachments);
    } catch (error) {
      console.error("createThreadAction failed", error);
      if (error instanceof AttachmentActionError) {
        redirect(
          appendQueryParams("/forum/new", {
            category: category?.slug ?? selectedCategory?.slug ?? "general-paddock",
            fromNewsletter: sourceNewsletter?.id ?? null,
            attachmentErrorCode: error.code,
          }),
        );
      }
      const normalized = normalizeWriteError(error);
      const fallbackSlug = category?.slug ?? selectedCategory?.slug ?? "general-paddock";
      redirect(
        appendQueryParams("/forum/new", {
          category: fallbackSlug,
          fromNewsletter: sourceNewsletter?.id ?? null,
          errorCode: normalized.code,
        }),
      );
    }

    revalidatePath("/forum");
    revalidatePath("/");
    revalidatePath("/categories");
    revalidatePath("/newsletter");
    if (category?.slug) {
      revalidatePath(`/forum/category/${category.slug}`);
      redirect(appendQueryParams(`/forum/category/${category.slug}`, { posted: "1" }));
    }

    redirect(`/forum/${newThreadId}`);
  }

  return (
    <main className="page-wrap stack">
      <section className="inline-actions">
        <Link href={selectedCategory ? `/forum/category/${encodeURIComponent(selectedCategory.slug)}` : "/forum"} className="btn-link focus-link">
          Back to forum
        </Link>
      </section>

      <section className="stack">
        <p className="kicker">New Thread</p>
        <h1>Create a discussion</h1>
        {sourceNewsletter ? (
          <p className="filter-chip">Linked to newsletter: {sourceNewsletter.title}</p>
        ) : null}
        <p className="meta">
          {selectedCategory ? `Posting in ${selectedCategory.name}` : "Choose a category and publish your thread."}
        </p>
      </section>

      <CreateThreadForm
        categories={categories}
        defaultCategoryId={defaultCategoryId}
        defaultTitle={defaultTitle}
        defaultBody={defaultBody}
        sourceNewsletterId={sourceNewsletter?.id ?? null}
        errorMessage={attachmentErrorMessage ?? submitErrorMessage}
        action={createThreadAction}
      />
    </main>
  );
}
