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
import { AvatarBadge } from "@/components/ui/avatar-badge";

type HeaderUserMenuProps = {
  email: string | null;
  showAdminLinks: boolean;
};

export function HeaderUserMenu({ email, showAdminLinks }: HeaderUserMenuProps) {
  return (
    <DropdownRoot>
      <DropdownTrigger asChild>
        <button type="button" className="user-menu-trigger" aria-label="Open user menu">
          <AvatarBadge email={email} />
          <span className="user-menu-text">Account</span>
        </button>
      </DropdownTrigger>
      <DropdownPortal>
        <DropdownContent className="user-menu-content" align="end" sideOffset={8}>
          <DropdownLabel className="user-menu-label">Signed in</DropdownLabel>
          <DropdownSeparator className="user-menu-separator" />
          <DropdownItem asChild>
            <Link href="/profile" className="user-menu-item">
              Profile
            </Link>
          </DropdownItem>
          <DropdownItem asChild>
            <Link href="/profile?tab=activity" className="user-menu-item">
              My threads
            </Link>
          </DropdownItem>
          <DropdownItem asChild>
            <Link href="/profile?tab=activity" className="user-menu-item">
              Activity
            </Link>
          </DropdownItem>
          <DropdownItem asChild>
            <Link href="/profile" className="user-menu-item">
              Settings
            </Link>
          </DropdownItem>
          <DropdownItem asChild>
            <Link href="/notifications" className="user-menu-item">
              Notifications archive
            </Link>
          </DropdownItem>
          <DropdownItem asChild>
            <Link href="/community-guidelines" className="user-menu-item">
              Community Guidelines
            </Link>
          </DropdownItem>
          <DropdownItem asChild>
            <Link href="/moderation-policy" className="user-menu-item">
              Moderation Policy
            </Link>
          </DropdownItem>
          {showAdminLinks ? (
            <>
              <DropdownItem asChild>
                <Link href="/admin" className="user-menu-item">
                  Admin
                </Link>
              </DropdownItem>
              <DropdownItem asChild>
                <Link href="/moderation/reports" className="user-menu-item">
                  Moderation
                </Link>
              </DropdownItem>
            </>
          ) : null}
          <DropdownSeparator className="user-menu-separator" />
          <form method="post" action="/auth/logout">
            <button type="submit" className="user-menu-item user-menu-logout">
              Logout
            </button>
          </form>
        </DropdownContent>
      </DropdownPortal>
    </DropdownRoot>
  );
}
