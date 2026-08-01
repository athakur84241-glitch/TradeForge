import type { Metadata } from "next";
import { ProfileWorkspace } from "@/features/profile/profile-workspace";

export const metadata: Metadata = {
  title: "Profile",
};

export default function Page() {
  return <ProfileWorkspace />;
}
