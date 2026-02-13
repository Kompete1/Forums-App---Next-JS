import type { Metadata } from "next";
import Link from "next/link";
import { listCategories } from "@/lib/db/categories";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Categories",
  description: "Browse forum categories for South African motorsport discussions, from circuit racing to karting and sim racing.",
};

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <main className="page-wrap stack">
      <section>
        <p className="kicker">Forum Structure</p>
        <h1>Categories</h1>
        <p className="meta">Use these sections to keep discussions focused and easier to find.</p>
      </section>

      <section className="category-grid">
        {categories.map((category) => (
          <article key={category.id} className="card stack">
            <Link href={`/forum/category/${encodeURIComponent(category.slug)}`} className="category-card-link focus-link">
              <h2>{category.name}</h2>
              <p className="meta">{category.description ?? "Community category"}</p>
              <p className="meta category-thread-count">{category.thread_count} threads</p>
              <span className="btn-link">Browse threads</span>
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
