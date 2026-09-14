import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/authorization";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  try {
    const { user } = await requireAdmin();
    return <AdminShell email={user.email ?? "Administrator"}>{children}</AdminShell>;
  } catch {
    redirect("/");
  }
}