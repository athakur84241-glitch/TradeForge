import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Auth callback route handler.
 *
 * Supabase uses this URL for:
 *  - Email confirmation (after sign-up)
 *  - Password-reset (redirected from the reset email)
 *
 * The ?code= query parameter is exchanged for a real session, then the
 * user is redirected to the appropriate destination.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to the update-password page for password-reset flows,
      // or to the workspace root for email-confirmation flows.
      const redirectPath = next.startsWith("/") ? next : "/";
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  // Something went wrong — send the user back to sign-in with an error hint.
  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`);
}
