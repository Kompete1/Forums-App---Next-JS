import { isCurrentUserAdmin } from "@/lib/db/roles";

// Compatibility helper retained for existing newsletter page imports.
export async function isCurrentUserNewsletterAdmin() {
  return isCurrentUserAdmin();
}
