import Link from "next/link";
import type { ForumCategory } from "@/lib/db/categories";

type CategoryHeaderProps = {
  category: ForumCategory;
  threadCount: number;
  isSignedIn: boolean;
};

export function CategoryHeader({ category, threadCount, isSignedIn }: CategoryHeaderProps) {
  const createThreadPath = `/forum/new?category=${encodeURIComponent(category.slug)}`;
  const loginToCreatePath = `/auth/login?next=${encodeURIComponent(createThreadPath)}`;

  return (
    <section className="card stack">
      <p className="kicker">Category Feed</p>
      <div className="inline-actions">
        <h1>{category.name}</h1>
        <p className="filter-chip">{threadCount} threads</p>
      </div>
      <p className="meta">{category.description ?? "Motorsport discussions in this category."}</p>
      <div className="inline-actions">
        <Link href="/categories" className="btn-link focus-link" prefetch={false}>
          Back to categories
        </Link>
        {isSignedIn ? (
          <Link href={createThreadPath} className="btn btn-primary" prefetch={false}>
            Create thread in this category
          </Link>
        ) : (
          <Link href={loginToCreatePath} className="btn btn-secondary" prefetch={false}>
            Login to create thread
          </Link>
        )}
      </div>
    </section>
  );
}
