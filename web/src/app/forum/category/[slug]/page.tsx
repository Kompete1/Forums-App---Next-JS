import { notFound } from "next/navigation";
import { listCategories } from "@/lib/db/categories";
import { listThreadsPage, type ThreadSort } from "@/lib/db/posts";
import { listRepliesByThreadIds } from "@/lib/db/replies";
import { CategoryHeader } from "@/components/category-header";
import { ForumFilterPanel } from "@/components/forum-filter-panel";
import { ThreadFeedList } from "@/components/thread-feed-list";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    q?: string | string[];
    sort?: string | string[];
    page?: string | string[];
    posted?: string | string[];
  }>;
};

function getParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function toPositiveInt(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}

function categoryHref(slug: string, input: { q?: string; sort?: string; page?: number }) {
  const search = new URLSearchParams();

  if (input.q) {
    search.set("q", input.q);
  }
  if (input.sort && input.sort !== "newest") {
    search.set("sort", input.sort);
  }
  if (input.page && input.page > 1) {
    search.set("page", String(input.page));
  }

  const query = search.toString();
  return query ? `/forum/category/${encodeURIComponent(slug)}?${query}` : `/forum/category/${encodeURIComponent(slug)}`;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const resolvedParams = (await searchParams) ?? {};
  const categories = await listCategories();
  const category = categories.find((item) => item.slug === slug) ?? null;

  if (!category) {
    notFound();
  }

  const query = getParamValue(resolvedParams.q);
  const sort = getParamValue(resolvedParams.sort) === "oldest" ? ("oldest" as ThreadSort) : ("newest" as ThreadSort);
  const page = toPositiveInt(getParamValue(resolvedParams.page), 1);
  const hasPostedNotice = getParamValue(resolvedParams.posted) === "1";

  const threadsPage = await listThreadsPage({
    categoryId: category.id,
    query,
    sort,
    page,
    pageSize: 10,
  });
  const repliesByThreadId = await listRepliesByThreadIds(threadsPage.threads.map((thread) => thread.id));
  const repliesCountByThreadId = Object.fromEntries(
    Object.entries(repliesByThreadId).map(([threadId, replies]) => [threadId, replies.length]),
  );
  const totalPages = Math.max(1, Math.ceil(threadsPage.total / threadsPage.pageSize));

  return (
    <main className="page-wrap stack">
      <CategoryHeader category={category} threadCount={threadsPage.total} />
      {hasPostedNotice ? <section className="card"><p className="success-note">Thread published successfully.</p></section> : null}

      <section className="forum-layout">
        <aside className="forum-rail stack">
          <ForumFilterPanel
            categories={categories}
            query={query}
            sort={sort}
            applyPath={`/forum/category/${encodeURIComponent(category.slug)}`}
            clearHref={`/forum/category/${encodeURIComponent(category.slug)}`}
            showCategorySelect={false}
            selectedLabel={category.name}
          />
        </aside>
        <div className="forum-main stack">
          <ThreadFeedList
            title="Threads in category"
            threads={threadsPage.threads}
            repliesCountByThreadId={repliesCountByThreadId}
            total={threadsPage.total}
            page={threadsPage.page}
            totalPages={totalPages}
            noResultsText="No threads found in this category yet."
            subtitleChip={`Showing: ${category.name}`}
            showRecentBadgeOnFirst={hasPostedNotice}
            prevHref={
              threadsPage.page > 1
                ? categoryHref(category.slug, {
                    q: query,
                    sort,
                    page: threadsPage.page - 1,
                  })
                : null
            }
            nextHref={
              threadsPage.page < totalPages
                ? categoryHref(category.slug, {
                    q: query,
                    sort,
                    page: threadsPage.page + 1,
                  })
                : null
            }
          />
        </div>
      </section>
    </main>
  );
}
