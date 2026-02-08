import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function toLoginRedirect(request: Request, status = 307) {
  const redirectUrl = new URL("/auth/login", request.url);
  return NextResponse.redirect(redirectUrl, status);
}

export async function GET(request: Request) {
  return toLoginRedirect(request);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  return toLoginRedirect(request, 303);
}
