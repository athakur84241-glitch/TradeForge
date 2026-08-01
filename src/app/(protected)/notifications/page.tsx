import type { Metadata } from "next";
import { NotificationsWorkspace } from "@/features/notifications/notifications-workspace";

export const metadata: Metadata = {
  title: "Notifications",
};

export default function Page() {
  return <NotificationsWorkspace />;
}
