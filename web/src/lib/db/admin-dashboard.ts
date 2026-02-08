import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/db/roles";
import { listMyRoles } from "@/lib/db/roles";
import type { ModerationReport } from "@/lib/db/reports";
import { listReportsForModeration } from "@/lib/db/reports";
import type { Newsletter } from "@/lib/db/newsletters";
import { listNewsletters } from "@/lib/db/newsletters";
import { listThreadsPage } from "@/lib/db/posts";
import type { SupabaseClient } from "@supabase/supabase-js";

type CountableTable = "posts" | "replies" | "reports" | "newsletters" | "profiles";

type AdminThreadSummary = {
  id: string;
  title: string;
  created_at: string;
  is_locked: boolean;
  author_display_name: string | null;
  author_id: string;
};

export type AdminDashboardData = {
  myRoles: AppRole[];
  totals: {
    threads: number;
    replies: number;
    reports: number;
    newsletters: number;
    users: number;
  };
  recentReports: ModerationReport[];
  recentNewsletters: Newsletter[];
  recentThreads: AdminThreadSummary[];
};

async function countRows(supabase: SupabaseClient, table: CountableTable) {
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function getAdminDashboardData() {
  const supabase = await createClient();
  const [myRoles, reports, newsletters, threadsPage, totalThreads, totalReplies, totalReports, totalNewsletters, totalUsers] =
    await Promise.all([
      listMyRoles(),
      listReportsForModeration(),
      listNewsletters(),
      listThreadsPage({ page: 1, pageSize: 6 }),
      countRows(supabase, "posts"),
      countRows(supabase, "replies"),
      countRows(supabase, "reports"),
      countRows(supabase, "newsletters"),
      countRows(supabase, "profiles"),
    ]);

  return {
    myRoles,
    totals: {
      threads: totalThreads,
      replies: totalReplies,
      reports: totalReports,
      newsletters: totalNewsletters,
      users: totalUsers,
    },
    recentReports: reports.slice(0, 6),
    recentNewsletters: newsletters.slice(0, 6),
    recentThreads: threadsPage.threads.map((thread) => ({
      id: thread.id,
      title: thread.title,
      created_at: thread.created_at,
      is_locked: thread.is_locked,
      author_display_name: thread.author_display_name,
      author_id: thread.author_id,
    })),
  } as AdminDashboardData;
}
