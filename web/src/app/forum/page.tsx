import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listCategories } from "@/lib/db/categories";
import { listThreadsPage, type ThreadSort } from "@/lib/db/posts";
import { getNewsletterById } from "@/lib/db/newsletters";
import { listRepliesByThreadIds } from "@/lib/db/replies";
import { ForumFilterPanel } from "@/components/forum-filter-panel";
import { ThreadFeedList } from "@/components/thread-feed-list";

export const dynamic = "force-dynamic";

type ForumPageProps = {
  searchParams?: Promise<{
    category?: string | string[];
    q?: string | string[];
    newsletter?: string | string[];
    sort?: string | string[];
    page?: string | string[];
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

function forumHref(input: { category?: string; q?: string; newsletter?: string; sort?: string; page?: number }) {
  const search = new URLSearchParams();

  if (input.category) {
    search.set("category", input.category);
  }
  if (input.q) {
    search.set("q", input.q);
  }
  if (input.newsletter) {
    search.set("newsletter", input.newsletter);
  }
  if (input.sort && input.sort !== "newest") {
    search.set("sort", input.sort);
  }
  if (input.page && input.page > 1) {
    search.set("page", String(input.page));
  }

  const query = search.toString();
  return query ? `/forum?${query}` : "/forum";
}

export default async function ForumPage({ searchParams }: ForumPageProps) {
  const resolvedParams = (await searchParams) ?? {};
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const categories = await listCategories();
  const selectedCategorySlug = getParamValue(resolvedParams.category);
  const selectedCategory = categories.find((category) => category.slug === selectedCategorySlug) ?? null;
  const hasInvalidCategoryFilter = Boolean(selectedCategorySlug) && !selectedCategory;
  const sort = getParamValue(resolvedParams.sort) === "oldest" ? ("oldest" as ThreadSort) : ("newest" as ThreadSort);
  const query = getParamValue(resolvedParams.q);
  const newsletterId = getParamValue(resolvedParams.newsletter);
  const page = toPositiveInt(getParamValue(resolvedParams.page), 1);
  const linkedNewsletter = newsletterId ? await getNewsletterById(newsletterId).catch(() => null) : null;
  const activeNewsletterId = linkedNewsletter?.id ?? "";
  const filterApplyPath = linkedNewsletter ? `/forum?newsletter=${encodeURIComponent(linkedNewsletter.id)}` : "/forum";

  const threadsPage = await listThreadsPage({
    categoryId: selectedCategory?.id,
    newsletterId: activeNewsletterId,
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
      <section>
        <p className="kicker">Forum Discovery</p>
        <h1>South African Motorsport Forum</h1>
        <p className="meta">{user ? `Signed in as ${user.email}` : "Browsing as guest. Sign in to post and reply."}</p>
        {linkedNewsletter ? <p className="filter-chip">Newsletter filter: {linkedNewsletter.title}</p> : null}
      </section>

      <section className="forum-layout">
        <aside className="forum-rail stack">
          <ForumFilterPanel
            categories={categories}
            selectedCategorySlug={selectedCategory?.slug}
            query={query}
            sort={sort}
            applyPath={filterApplyPath}
            clearHref={linkedNewsletter ? `/forum?newsletter=${encodeURIComponent(linkedNewsletter.id)}` : "/forum"}
            showCategorySelect
            selectedLabel={selectedCategory?.name ?? "All categories"}
          />

          <section className="card stack">
            <div className="inline-actions">
              <h3>Quick categories</h3>
              <Link href="/categories" className="btn-link focus-link">
                View all
              </Link>
            </div>
            {hasInvalidCategoryFilter ? (
              <p className="meta">Invalid category filter was reset.</p>
            ) : null}
            <div className="stack-tight">
              {categories.map((category) => (
                <Link key={category.id} href={`/forum/category/${encodeURIComponent(category.slug)}`} className="category-quick-link focus-link">
                  {category.name}
                </Link>
              ))}
            </div>
            {user ? (
              <Link
                href={selectedCategory?.slug ? `/forum/new?category=${encodeURIComponent(selectedCategory.slug)}` : "/forum/new"}
                className="btn btn-primary"
              >
                Create thread
              </Link>
            ) : (
              <Link href="/auth/login" className="btn btn-secondary">
                Login to create thread
              </Link>
            )}
          </section>
        </aside>

        <div className="forum-main stack">
          <ThreadFeedList
            threads={threadsPage.threads}
            repliesCountByThreadId={repliesCountByThreadId}
            total={threadsPage.total}
            page={threadsPage.page}
            totalPages={totalPages}
            noResultsText="No threads found for this filter."
            subtitleChip={
              linkedNewsletter
                ? `Showing: ${selectedCategory?.name ?? "All categories"} | Linked to: ${linkedNewsletter.title}`
                : `Showing: ${selectedCategory?.name ?? "All categories"}`
            }
            prevHref={
              threadsPage.page > 1
                ? forumHref({
                    category: selectedCategory?.slug,
                    q: query,
                    newsletter: linkedNewsletter?.id,
                    sort,
                    page: threadsPage.page - 1,
                  })
                : null
            }
            nextHref={
              threadsPage.page < totalPages
                ? forumHref({
                    category: selectedCategory?.slug,
                    q: query,
                    newsletter: linkedNewsletter?.id,
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
