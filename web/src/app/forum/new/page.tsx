import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listCategories } from "@/lib/db/categories";
import { createThread } from "@/lib/db/posts";
import { CreateThreadForm } from "@/components/create-thread-form";

export const dynamic = "force-dynamic";

type NewThreadPageProps = {
  searchParams?: Promise<{
    category?: string | string[];
    error?: string | string[];
  }>;
};

function getParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

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
  const requestedSlug = getParamValue(resolvedParams.category);
  const hasSubmitError = getParamValue(resolvedParams.error) === "1";
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
      const fallbackSlug = category?.slug ?? selectedCategory?.slug ?? "general-paddock";
      redirect(`/forum/new?category=${encodeURIComponent(fallbackSlug)}&error=1`);
    }

    revalidatePath("/forum");
    revalidatePath("/");
    revalidatePath("/categories");
    if (category?.slug) {
      revalidatePath(`/forum/category/${category.slug}`);
      redirect(`/forum/category/${category.slug}?posted=1`);
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
        hasError={hasSubmitError}
        action={createThreadAction}
      />
    </main>
  );
}
