"use server";

import { requireUser } from "@/lib/authorization";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function getProfile() {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase.from("profiles").select("id, display_name, first_name, last_name, phone, country, timezone, language, role, preferences").eq("id", user.id).maybeSingle();
  if (error) throw new Error("Unable to load profile.");
  return data ?? { id: user.id, display_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User", first_name: "", last_name: "", phone: "", country: "", timezone: "UTC", language: "English (UK)", role: "trader", preferences: {} };
}

export async function updateProfile(values: { firstName: string; lastName: string; phone: string; country: string; timezone: string; language: string }) {
  const { user } = await requireUser();
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("profiles").upsert({ id: user.id, first_name: values.firstName.trim(), last_name: values.lastName.trim(), display_name: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(), phone: values.phone.trim(), country: values.country, timezone: values.timezone, language: values.language, updated_at: new Date().toISOString() });
  if (error) throw new Error("Unable to save profile.");
}

export async function updatePreferences(preferences: Record<string, boolean>) {
  const { user } = await requireUser();
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("profiles").upsert({ id: user.id, preferences, updated_at: new Date().toISOString() });
  if (error) throw new Error("Unable to save preferences.");
}