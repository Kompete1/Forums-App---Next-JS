"use client";

type AvatarBadgeProps = {
  email: string | null;
};

function initialsFromEmail(email: string | null) {
  const value = (email ?? "").trim();
  if (!value) {
    return "U";
  }

  const local = value.split("@")[0] ?? value;
  const chunks = local.split(/[._-]+/).filter(Boolean);
  if (chunks.length >= 2) {
    return `${chunks[0][0] ?? ""}${chunks[1][0] ?? ""}`.toUpperCase();
  }

  return local.slice(0, 2).toUpperCase();
}

export function AvatarBadge({ email }: AvatarBadgeProps) {
  return <span className="avatar-badge">{initialsFromEmail(email)}</span>;
}
