import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listCategories } from "@/lib/db/categories";
import { createThread } from "@/lib/db/posts";
import { normalizeWriteError } from "@/lib/db/write-errors";
import { appendQueryParams, getSingleSearchParam, getWriteErrorMessageFromSearchParams } from "@/lib/ui/flash-message";
import { CreateThreadForm } from "@/components/create-thread-form";

export const dynamic = "force-dynamic";

type NewThreadPageProps = {
  searchParams?: Promise<{
    category?: string | string[];
    errorCode?: string | string[];
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
  const submitErrorMessage = getWriteErrorMessageFromSearchParams(resolvedParams, "errorCode");
  const selectedCategory =
    categories.find((category) => category.slug === requestedSlug) ??
    categories.find((category) => category.slug === "general-paddock") ??
    categories[0] ??
    null;
  const defaultCategoryId = selectedCategory?.id ?? "";

  async function createThreadAction(formData: FormData) {
    "use server";

    const title = String(formData.get("title") ?? "");
    const body = String(formData.get("body") ?? "");
    const categoryId = String(formData.get("categoryId") ?? "");
    const category = categories.find((item) => item.id === categoryId) ?? null;

    let newThreadId = "";
    try {
      newThreadId = await createThread({ title, body, categoryId });
    } catch (error) {
      console.error("createThreadAction failed", error);
      const normalized = normalizeWriteError(error);
      const fallbackSlug = category?.slug ?? selectedCategory?.slug ?? "general-paddock";
      redirect(appendQueryParams("/forum/new", { category: fallbackSlug, errorCode: normalized.code }));
    }

    revalidatePath("/forum");
    revalidatePath("/");
    revalidatePath("/categories");
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
        <p className="meta">
          {selectedCategory ? `Posting in ${selectedCategory.name}` : "Choose a category and publish your thread."}
        </p>
      </section>

      <CreateThreadForm
        categories={categories}
        defaultCategoryId={defaultCategoryId}
        errorMessage={submitErrorMessage}
        action={createThreadAction}
      />
    </main>
  );
}
