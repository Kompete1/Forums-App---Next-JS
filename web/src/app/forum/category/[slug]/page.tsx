import { notFound } from "next/navigation";
import { listCategories } from "@/lib/db/categories";
import { listThreadsPage, type ThreadSort } from "@/lib/db/posts";
import { listRepliesByThreadIds } from "@/lib/db/replies";
import { getThreadLikeCounts } from "@/lib/db/reactions";
import { getCurrentUser } from "@/lib/supabase/auth";
import { CategoryHeader } from "@/components/category-header";
import { ForumFilterPanel } from "@/components/forum-filter-panel";
import { ThreadFeedList } from "@/components/thread-feed-list";
import { getSignalLabel, getSortLabel, matchesSignalFilter, parseSignalFilter, type SignalFilter } from "@/lib/ui/discovery-signals";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    q?: string | string[];
    sort?: string | string[];
    signal?: string | string[];
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

function categoryHref(
  slug: string,
  input: {
    q?: string;
    sort?: string;
    signal?: SignalFilter;
    page?: number;
  },
) {
  const search = new URLSearchParams();

  if (input.q) {
    search.set("q", input.q);
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
  return query ? `/forum/category/${encodeURIComponent(slug)}?${query}` : `/forum/category/${encodeURIComponent(slug)}`;
}

async function listCategoryThreadsWithSignalFilter(input: {
  categoryId: string;
  query: string;
  sort: ThreadSort;
  signal: SignalFilter;
  page: number;
  pageSize: number;
}) {
  if (input.signal === "all") {
    return listThreadsPage({
      categoryId: input.categoryId,
      query: input.query,
      sort: input.sort,
      page: input.page,
      pageSize: input.pageSize,
    });
  }

  const sourcePageSize = 30;
  const firstPage = await listThreadsPage({
    categoryId: input.categoryId,
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

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const resolvedParams = (await searchParams) ?? {};
  const user = await getCurrentUser();
  const categories = await listCategories();
  const category = categories.find((item) => item.slug === slug) ?? null;

  if (!category) {
    notFound();
  }

  const query = getParamValue(resolvedParams.q);
  const rawSort = getParamValue(resolvedParams.sort);
  const sort = rawSort === "oldest" ? ("oldest" as ThreadSort) : rawSort === "newest" ? ("newest" as ThreadSort) : ("activity" as ThreadSort);
  const signal = parseSignalFilter(getParamValue(resolvedParams.signal));
  const page = toPositiveInt(getParamValue(resolvedParams.page), 1);
  const hasPostedNotice = getParamValue(resolvedParams.posted) === "1";

  const threadsPage = await listCategoryThreadsWithSignalFilter({
    categoryId: category.id,
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
  const contextParts = [`Sort: ${sortLabel}`, `Category: ${category.name}`];
  if (query) {
    contextParts.push(`Search: "${query}"`);
  }
  contextParts.push(`Signal: ${getSignalLabel(signal)}`);
  const discoveryContextLine = contextParts.join(" | ");

  return (
    <main className="page-wrap stack">
      <CategoryHeader category={category} threadCount={threadsPage.total} isSignedIn={Boolean(user)} />
      {hasPostedNotice ? <section className="card"><p className="success-note">Thread published successfully.</p></section> : null}

      <section className="forum-layout">
        <aside className="forum-rail stack">
          <ForumFilterPanel
            categories={categories}
            query={query}
            sort={sort}
            signal={signal}
            applyPath={`/forum/category/${encodeURIComponent(category.slug)}`}
            clearHref={`/forum/category/${encodeURIComponent(category.slug)}`}
            quickFilterHrefs={{
              all: categoryHref(category.slug, {
                q: query,
                sort,
                page: 1,
              }),
              unanswered: categoryHref(category.slug, {
                q: query,
                sort,
                signal: "unanswered",
                page: 1,
              }),
              active: categoryHref(category.slug, {
                q: query,
                sort,
                signal: "active",
                page: 1,
              }),
              popular: categoryHref(category.slug, {
                q: query,
                sort,
                signal: "popular",
                page: 1,
              }),
            }}
            showCategorySelect={false}
            selectedLabel={category.name}
          />
        </aside>
        <div className="forum-main stack">
          <ThreadFeedList
            title="Threads in category"
            threads={threadsPage.threads}
            repliesCountByThreadId={repliesCountByThreadId}
            threadLikeCountByThreadId={threadLikeCountByThreadId}
            total={threadsPage.total}
            page={threadsPage.page}
            totalPages={totalPages}
            noResultsText="No threads found in this category yet."
            subtitleChip={`Showing: ${category.name}`}
            contextLine={discoveryContextLine}
            showRecentBadgeOnFirst={hasPostedNotice}
            pageHref={(targetPage) =>
              categoryHref(category.slug, {
                q: query,
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
