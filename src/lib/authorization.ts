import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Authentication required.");
  return { supabase, user };
}

export async function requireAdmin() {
  const { user } = await requireUser();
  const admin = createSupabaseAdminClient();
  const { data: profile, error } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (error || profile?.role !== "admin") throw new Error("Administrator access required.");
  return { admin, user };
}