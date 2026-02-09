import type { NotificationKind } from "@/lib/db/notifications";

export function formatNotificationMessage(input: {
  kind: NotificationKind;
  actorDisplayName: string | null;
  actorId: string | null;
}) {
  const actorLabel = input.actorDisplayName ?? input.actorId ?? "Someone";

  if (input.kind === "reply_received") {
    return `${actorLabel} replied to your thread.`;
  }

  if (input.kind === "thread_reported") {
    return `${actorLabel} submitted a content report.`;
  }

  if (input.kind === "report_status_changed") {
    return "A report status changed.";
  }

  return "Notification";
}
