import Link from "next/link";
import type { ForumCategory } from "@/lib/db/categories";
import type { ThreadSort } from "@/lib/db/posts";

type ForumFilterPanelProps = {
  categories: ForumCategory[];
  selectedCategorySlug?: string;
  query: string;
  sort: ThreadSort;
  applyPath: string;
  clearHref: string;
  showCategorySelect: boolean;
  selectedLabel: string;
};

export function ForumFilterPanel({
  categories,
  selectedCategorySlug,
  query,
  sort,
  applyPath,
  clearHref,
  showCategorySelect,
  selectedLabel,
}: ForumFilterPanelProps) {
  return (
    <section className="card stack">
      <div className="inline-actions">
        <h2>Filters</h2>
        <p className="filter-chip">{selectedLabel}</p>
      </div>
      <form method="get" action={applyPath} className="stack">
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
    </section>
  );
}
