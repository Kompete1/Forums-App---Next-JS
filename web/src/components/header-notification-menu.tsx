"use client";

import Link from "next/link";
import {
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownPortal,
  DropdownRoot,
  DropdownSeparator,
  DropdownTrigger,
} from "@/components/ui/dropdown-menu";

type HeaderNotificationPreview = {
  id: string;
  message: string;
  createdAt: string;
  href: string;
  isRead: boolean;
};

type HeaderNotificationMenuProps = {
  unreadCount: number;
  previews: HeaderNotificationPreview[];
  markAllAction: () => Promise<void>;
};

export function HeaderNotificationMenu({ unreadCount, previews, markAllAction }: HeaderNotificationMenuProps) {
  const unreadLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <DropdownRoot>
      <DropdownTrigger asChild>
        <button type="button" className="notification-trigger" aria-label="Open notifications">
          <svg aria-hidden viewBox="0 0 24 24" width="16" height="16" className="notification-icon">
            <path
              d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm6-6V11a6 6 0 1 0-12 0v5l-1.5 2v1h15v-1L18 16Z"
              fill="currentColor"
            />
          </svg>
          {unreadCount > 0 ? <span className="unread-badge">{unreadLabel}</span> : null}
        </button>
      </DropdownTrigger>
      <DropdownPortal>
        <DropdownContent className="user-menu-content notifications-menu" align="end" sideOffset={8}>
          <DropdownLabel className="user-menu-label">Notifications</DropdownLabel>
          <DropdownSeparator className="user-menu-separator" />
          {previews.length === 0 ? <p className="meta notification-empty">No new notifications.</p> : null}
          {previews.map((notification) => (
            <DropdownItem key={notification.id} asChild>
              <Link href={notification.href} className={`notification-preview-item ${notification.isRead ? "notification-preview-read" : ""}`}>
                <span className="notification-preview-message">{notification.message}</span>
                <span className="meta">{new Date(notification.createdAt).toLocaleString()}</span>
              </Link>
            </DropdownItem>
          ))}
          <DropdownSeparator className="user-menu-separator" />
          <div className="notification-preview-actions">
            <form action={markAllAction}>
              <button type="submit" className="btn btn-secondary">
                Mark all read
              </button>
            </form>
            <Link href="/notifications" className="btn-link focus-link">
              View all
            </Link>
          </div>
        </DropdownContent>
      </DropdownPortal>
    </DropdownRoot>
  );
}
