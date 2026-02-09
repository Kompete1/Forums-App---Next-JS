import type { ForumCategory } from "@/lib/db/categories";

type CategoryHeaderProps = {
  category: ForumCategory;
  threadCount: number;
  isSignedIn: boolean;
};

export function CategoryHeader({ category, threadCount, isSignedIn }: CategoryHeaderProps) {
  const createThreadPath = `/forum/new?category=${encodeURIComponent(category.slug)}`;
  const loginToCreatePath = `/auth/login?returnTo=${encodeURIComponent(createThreadPath)}`;

  return (
    <section className="card stack">
      <p className="kicker">Category Feed</p>
      <div className="inline-actions">
        <h1>{category.name}</h1>
        <p className="filter-chip">{threadCount} threads</p>
      </div>
      <p className="meta">{category.description ?? "Motorsport discussions in this category."}</p>
      <div className="inline-actions">
        <a href="/categories" className="btn-link focus-link">
          Back to categories
        </a>
        {isSignedIn ? (
          <a href={createThreadPath} className="btn btn-primary">
            Create thread in this category
          </a>
        ) : (
          <a href={loginToCreatePath} className="btn btn-secondary">
            Login to create thread
          </a>
        )}
      </div>
    </section>
  );
}
