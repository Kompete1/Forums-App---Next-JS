import Link from "next/link";
import type { ForumCategory } from "@/lib/db/categories";

type CategoryHeaderProps = {
  category: ForumCategory;
  threadCount: number;
};

export function CategoryHeader({ category, threadCount }: CategoryHeaderProps) {
  return (
    <section className="card stack">
      <p className="kicker">Category Feed</p>
      <div className="inline-actions">
        <h1>{category.name}</h1>
        <p className="filter-chip">{threadCount} threads</p>
      </div>
      <p className="meta">{category.description ?? "Motorsport discussions in this category."}</p>
      <div className="inline-actions">
        <Link href="/categories" className="btn-link focus-link">
          Back to categories
        </Link>
        <Link href={`/forum/new?category=${encodeURIComponent(category.slug)}`} className="btn btn-primary">
          Create thread in this category
        </Link>
      </div>
    </section>
  );
}
