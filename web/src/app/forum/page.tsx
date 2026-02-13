import type { Metadata } from "next";
import Link from "next/link";
import { listCategories } from "@/lib/db/categories";
import { listThreadsPage, type ThreadSort } from "@/lib/db/posts";
import { getNewsletterById } from "@/lib/db/newsletters";
import { listRepliesByThreadIds } from "@/lib/db/replies";
import { getThreadLikeCounts } from "@/lib/db/reactions";
import { getCurrentUser } from "@/lib/supabase/auth";
import { ForumFilterPanel } from "@/components/forum-filter-panel";
import { ThreadFeedList } from "@/components/thread-feed-list";
import { getSignalLabel, getSortLabel, matchesSignalFilter, parseSignalFilter, type SignalFilter } from "@/lib/ui/discovery-signals";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Forum",
  description: "Explore active South African motorsport threads, filter by category, and join race-focused discussions.",
};

type ForumPageProps = {
  searchParams?: Promise<{
    category?: string | string[];
    q?: string | string[];
    newsletter?: string | string[];
    sort?: string | string[];
    signal?: string | string[];
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

function forumHref(input: {
  category?: string;
  q?: string;
  newsletter?: string;
  sort?: string;
  signal?: SignalFilter;
  page?: number;
}) {
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
  if (input.sort && input.sort !== "activity") {
    search.set("sort", input.sort);
  }
  if (input.signal && input.signal !== "all") {
    search.set("signal", input.signal);
  }
  if (input.page && input.page > 1) {
    search.set("page", String(input.page));
  }

  const query = search.toString();
  return query ? `/forum?${query}` : "/forum";
}

async function listForumThreadsWithSignalFilter(input: {
  categoryId?: string;
  newsletterId?: string;
  query: string;
  sort: ThreadSort;
  signal: SignalFilter;
  page: number;
  pageSize: number;
}) {
  if (input.signal === "all") {
    return listThreadsPage({
      categoryId: input.categoryId,
      newsletterId: input.newsletterId,
      query: input.query,
      sort: input.sort,
      page: input.page,
      pageSize: input.pageSize,
    });
  }

  const sourcePageSize = 30;
  const firstPage = await listThreadsPage({
    categoryId: input.categoryId,
    newsletterId: input.newsletterId,
    query: input.query,
    sort: input.sort,
    page: 1,
    pageSize: sourcePageSize,
  });

  let sourceThreads = [...firstPage.threads];
  const sourceTotalPages = Math.max(1, Math.ceil(firstPage.total / sourcePageSize));
  for (let sourcePage = 2; sourcePage <= sourceTotalPages; sourcePage += 1) {
    const nextPage = await listThreadsPage({
      categoryId: input.categoryId,
      newsletterId: input.newsletterId,
      query: input.query,
      sort: input.sort,
      page: sourcePage,
      pageSize: sourcePageSize,
    });
    sourceThreads = sourceThreads.concat(nextPage.threads);
  }

  const repliesByThreadId = await listRepliesByThreadIds(sourceThreads.map((thread) => thread.id));
  const filteredThreads = sourceThreads.filter((thread) => {
    const repliesCount = repliesByThreadId[thread.id]?.length ?? 0;
    return matchesSignalFilter({
      signal: input.signal,
      repliesCount,
      lastActivityAt: thread.last_activity_at,
    });
  });

  const filteredTotal = filteredThreads.length;
  const filteredTotalPages = Math.max(1, Math.ceil(filteredTotal / input.pageSize));
  const clampedPage = Math.min(input.page, filteredTotalPages);
  const from = (clampedPage - 1) * input.pageSize;
  const to = from + input.pageSize;

  return {
    threads: filteredThreads.slice(from, to),
    total: filteredTotal,
    page: clampedPage,
    pageSize: input.pageSize,
  };
}

export default async function ForumPage({ searchParams }: ForumPageProps) {
  const resolvedParams = (await searchParams) ?? {};
  const user = await getCurrentUser();

  const categories = await listCategories();
  const selectedCategorySlug = getParamValue(resolvedParams.category);
  const selectedCategory = categories.find((category) => category.slug === selectedCategorySlug) ?? null;
  const hasInvalidCategoryFilter = Boolean(selectedCategorySlug) && !selectedCategory;
  const rawSort = getParamValue(resolvedParams.sort);
  const sort = rawSort === "oldest" ? ("oldest" as ThreadSort) : rawSort === "newest" ? ("newest" as ThreadSort) : ("activity" as ThreadSort);
  const signal = parseSignalFilter(getParamValue(resolvedParams.signal));
  const query = getParamValue(resolvedParams.q);
  const newsletterId = getParamValue(resolvedParams.newsletter);
  const page = toPositiveInt(getParamValue(resolvedParams.page), 1);
  const linkedNewsletter = newsletterId ? await getNewsletterById(newsletterId).catch(() => null) : null;
  const activeNewsletterId = linkedNewsletter?.id ?? "";
  const filterApplyHrefBase = linkedNewsletter ? `/forum?newsletter=${encodeURIComponent(linkedNewsletter.id)}` : "/forum";

  const threadsPage = await listForumThreadsWithSignalFilter({
    categoryId: selectedCategory?.id,
    newsletterId: activeNewsletterId,
    query,
    sort,
    signal,
    page,
    pageSize: 10,
  });

  const [repliesByThreadId, threadLikeCountByThreadId] = await Promise.all([
    listRepliesByThreadIds(threadsPage.threads.map((thread) => thread.id)),
    getThreadLikeCounts(threadsPage.threads.map((thread) => thread.id)).catch(() => ({} as Record<string, number>)),
  ]);
  const repliesCountByThreadId = Object.fromEntries(
    Object.entries(repliesByThreadId).map(([threadId, replies]) => [threadId, replies.length]),
  );
  const totalPages = Math.max(1, Math.ceil(threadsPage.total / threadsPage.pageSize));
  const sortLabel = getSortLabel(sort);
  const contextParts = [`Sort: ${sortLabel}`];
  if (query) {
    contextParts.push(`Search: "${query}"`);
  }
  if (selectedCategory) {
    contextParts.push(`Category: ${selectedCategory.name}`);
  }
  if (linkedNewsletter) {
    contextParts.push(`Newsletter: ${linkedNewsletter.title}`);
  }
  contextParts.push(`Signal: ${getSignalLabel(signal)}`);
  const discoveryContextLine = contextParts.join(" | ");

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
            signal={signal}
            applyPath={filterApplyHrefBase}
            clearHref={filterApplyHrefBase}
            quickFilterHrefs={{
              all: forumHref({
                category: selectedCategory?.slug,
                q: query,
                newsletter: linkedNewsletter?.id,
                sort,
                page: 1,
              }),
              unanswered: forumHref({
                category: selectedCategory?.slug,
                q: query,
                newsletter: linkedNewsletter?.id,
                sort,
                signal: "unanswered",
                page: 1,
              }),
              active: forumHref({
                category: selectedCategory?.slug,
                q: query,
                newsletter: linkedNewsletter?.id,
                sort,
                signal: "active",
                page: 1,
              }),
              popular: forumHref({
                category: selectedCategory?.slug,
                q: query,
                newsletter: linkedNewsletter?.id,
                sort,
                signal: "popular",
                page: 1,
              }),
            }}
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
              <Link
                href={
                  selectedCategory?.slug
                    ? `/auth/login?returnTo=${encodeURIComponent(`/forum/new?category=${selectedCategory.slug}`)}`
                    : "/auth/login?returnTo=%2Fforum%2Fnew"
                }
                className="btn btn-secondary"
              >
                Login to create thread
              </Link>
            )}
          </section>
        </aside>

        <div className="forum-main stack">
          <ThreadFeedList
            threads={threadsPage.threads}
            repliesCountByThreadId={repliesCountByThreadId}
            threadLikeCountByThreadId={threadLikeCountByThreadId}
            total={threadsPage.total}
            page={threadsPage.page}
            totalPages={totalPages}
            noResultsText="No threads found for this filter."
            subtitleChip={
              linkedNewsletter
                ? `Showing: ${selectedCategory?.name ?? "All categories"} | Linked to: ${linkedNewsletter.title}`
                : `Showing: ${selectedCategory?.name ?? "All categories"}`
            }
            contextLine={discoveryContextLine}
            pageHref={(targetPage) =>
              forumHref({
                category: selectedCategory?.slug,
                q: query,
                newsletter: linkedNewsletter?.id,
                sort,
                signal,
                page: targetPage,
              })
            }
          />
        </div>
      </section>
    </main>
  );
}
