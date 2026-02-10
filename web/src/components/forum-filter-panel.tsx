import Link from "next/link";
import type { ForumCategory } from "@/lib/db/categories";
import type { ThreadSort } from "@/lib/db/posts";
import { getSignalLabel, getSortLabel, type SignalFilter } from "@/lib/ui/discovery-signals";

type ForumFilterPanelProps = {
  categories: ForumCategory[];
  selectedCategorySlug?: string;
  query: string;
  sort: ThreadSort;
  signal: SignalFilter;
  applyPath: string;
  clearHref: string;
  quickFilterHrefs: Record<SignalFilter, string>;
  showCategorySelect: boolean;
  selectedLabel: string;
};

export function ForumFilterPanel({
  categories,
  selectedCategorySlug,
  query,
  sort,
  signal,
  applyPath,
  clearHref,
  quickFilterHrefs,
  showCategorySelect,
  selectedLabel,
}: ForumFilterPanelProps) {
  return (
    <details className="card stack filter-collapsible" open>
      <summary className="filter-summary">Filters</summary>
      <div className="inline-actions">
        <h2>Filters</h2>
        <p className="filter-chip">{selectedLabel}</p>
        <p className="meta">Sort: {getSortLabel(sort)}</p>
      </div>
      <div className="quick-filter-row" aria-label="Quick filters">
        {(["all", "unanswered", "active", "popular"] as SignalFilter[]).map((item) => (
          <Link
            key={item}
            href={quickFilterHrefs[item]}
            className={`filter-chip ${signal === item ? "filter-chip-active" : ""}`}
            aria-current={signal === item ? "true" : undefined}
          >
            {getSignalLabel(item)}
          </Link>
        ))}
      </div>
      <form method="get" action={applyPath} className="stack">
        {signal !== "all" ? <input type="hidden" name="signal" value={signal} /> : null}
        {showCategorySelect ? (
          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" defaultValue={selectedCategorySlug ?? ""}>
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="field">
          <label htmlFor="q">Search</label>
          <input id="q" name="q" type="text" defaultValue={query} placeholder="Search thread title or body" />
        </div>
        <div className="field">
          <label htmlFor="sort">Sort</label>
          <select id="sort" name="sort" defaultValue={sort}>
            <option value="activity">Most recent activity</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
        <div className="inline-actions">
          <button type="submit" className="btn btn-primary">
            Apply
          </button>
          <Link href={clearHref} className="btn btn-secondary">
            Clear
          </Link>
        </div>
      </form>
    </details>
  );
}
