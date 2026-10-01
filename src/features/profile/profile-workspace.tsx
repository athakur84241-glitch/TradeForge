"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  Download,
  Globe2,
  KeyRound,
  Laptop,
  Mail,
  MapPin,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import { DemoAction } from "@/components/workspace/demo-action";
import { PageHeader } from "@/components/workspace/page-header";
import { SectionCard } from "@/components/workspace/section-card";
import { StatusBadge } from "@/components/workspace/status-badge";
import { getUserAccountOverviews, type AccountOverview } from "@/features/accounts/account-service";
import { getProfile, updateProfile } from "@/features/profile/profile-service";
import { loginActivity } from "@/features/workspace/mock-data";
import { supabase } from "@/lib/supabase";

export function ProfileWorkspace() {
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [profile, setProfile] = useState<{ display_name?: string | null; first_name?: string | null; last_name?: string | null; phone?: string | null; country?: string | null; timezone?: string | null; language?: string | null; role?: string | null }>({});
  const [accountHistory, setAccountHistory] = useState<AccountOverview[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [displayName, setDisplayName] = useState("User");
  const [initials, setInitials] = useState("U");

  useEffect(() => {
    void getProfile().then((nextProfile) => {
      setProfile(nextProfile);
      const resolvedName = [nextProfile.first_name, nextProfile.last_name].filter(Boolean).join(" ").trim() || nextProfile.display_name || "User";
      setDisplayName(resolvedName);
      setInitials(resolvedName.split(/\s+/).filter(Boolean).slice(0, 2).map((part: string) => part[0]?.toUpperCase() ?? "").join("") || "U");
    }).catch(() => undefined);

    void getUserAccountOverviews().then(setAccountHistory).catch(() => undefined);

    void supabase.auth.getUser().then(({ data: { user } }) => {
      const nextEmail = user?.email ?? "";
      setUserEmail(nextEmail);
      if (!user) return;
      const fullName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "";
      if (fullName) {
        setDisplayName(fullName);
        setInitials(fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((part: string) => part[0]?.toUpperCase() ?? "").join("") || "U");
      }
    });
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const nextProfile = {
      firstName: String(values.get("firstName") ?? ""),
      lastName: String(values.get("lastName") ?? ""),
      phone: String(values.get("phone") ?? ""),
      country: String(values.get("country") ?? ""),
      timezone: String(values.get("timezone") ?? ""),
      language: String(values.get("language") ?? ""),
    };
    await updateProfile(nextProfile);
    setProfile((current) => ({ ...current, ...nextProfile, display_name: `${nextProfile.firstName} ${nextProfile.lastName}`.trim() || current.display_name }));
    setProfileSaved(true);
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    if (values.get("newPassword") !== values.get("confirmPassword")) return;
    await supabase.auth.updateUser({ password: String(values.get("newPassword")) });
    setPasswordSaved(true);
  }

  const primaryAccount = accountHistory[0] ?? null;
  const memberRole = profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Trader";

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Profile"
        title="Your profile"
        description="Keep contact details and workspace preferences aligned with your live profile record."
        action={
          <DemoAction confirmation="Profile exported">
            <Download className="size-4" /> Download profile
          </DemoAction>
        }
      />

      <div className="grid gap-6 xl:grid-cols-12">
        <SectionCard className="xl:col-span-8" contentClassName="p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="grid size-16 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/15 font-display text-lg font-bold text-primary">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl">{displayName}</h2>
                <StatusBadge tone="primary">Profile active</StatusBadge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{memberRole}</p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" /> {userEmail ? `Email on file` : "Profile ready"}</span>
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> Account verification depends on your evaluation lifecycle</span>
              </div>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Primary account", primaryAccount?.name ?? "No account yet"],
              ["Trader role", memberRole],
              ["Email", userEmail || "Not available"],
              ["Timezone", profile.timezone ?? "UTC"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-tf-md border border-border bg-surface p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-2 text-sm font-semibold break-words">{value}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Security summary" description="Latest profile security posture." className="xl:col-span-4">
          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-4 rounded-tf-md border border-success/20 bg-success/10 p-4">
              <span className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="size-4 text-success" /> Account profile</span>
              <span className="text-xs text-success">Ready</span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-tf-md border border-border bg-surface p-4">
              <span className="flex items-center gap-2 text-sm font-medium"><KeyRound className="size-4 text-primary" /> Two-factor auth</span>
              <span className="text-xs text-warning">Not enabled</span>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{userEmail ? `Security updates will be sent to ${userEmail}.` : "Security updates will be sent to your registered email when available."}</p>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <SectionCard title="Personal information" description="Keep contact and regional details aligned with your live backend profile." className="xl:col-span-8">
          <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">First name<Input name="firstName" defaultValue={profile.first_name ?? ""} /></label>
            <label className="grid gap-2 text-sm font-medium">Last name<Input name="lastName" defaultValue={profile.last_name ?? ""} /></label>
            <label className="grid gap-2 text-sm font-medium">Email<Input type="email" value={userEmail} readOnly /></label>
            <label className="grid gap-2 text-sm font-medium">Phone<Input name="phone" type="tel" defaultValue={profile.phone ?? ""} /></label>
            <label className="grid gap-2 text-sm font-medium">
              Country
              <select name="country" className="h-11 rounded-tf-md border border-border bg-surface px-3 text-sm text-foreground" defaultValue={profile.country ?? ""}>
                <option value="">Select a country</option><option>United Kingdom</option><option>India</option><option>United Arab Emirates</option><option>United States</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Timezone
              <select name="timezone" className="h-11 rounded-tf-md border border-border bg-surface px-3 text-sm text-foreground" defaultValue={profile.timezone ?? "UTC"}>
                <option value="UTC">UTC</option><option value="Europe/London (UTC+1)">Europe/London (UTC+1)</option><option value="Asia/Kolkata (UTC+5:30)">Asia/Kolkata (UTC+5:30)</option><option value="America/New_York (UTC-4)">America/New_York (UTC-4)</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium sm:col-span-2">
              Language
              <select name="language" className="h-11 rounded-tf-md border border-border bg-surface px-3 text-sm text-foreground" defaultValue={profile.language ?? "English (UK)"}>
                <option>English (UK)</option><option>English (US)</option><option>Hindi</option>
              </select>
            </label>
            <div className="flex items-center justify-end gap-3 sm:col-span-2">
              {profileSaved && <span className="inline-flex items-center gap-1.5 text-sm text-success"><Check className="size-4" /> Saved</span>}
              <Button type="submit">Save profile</Button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Trading preferences" description="Current preference summary from your profile." className="xl:col-span-4">
          <dl className="grid gap-4">
            {[
              { label: "Primary session", value: "London open", icon: Globe2 },
              { label: "Preferred markets", value: "FX majors, XAU/USD", icon: MapPin },
              { label: "Risk per trade", value: "0.50% target", icon: ShieldCheck },
              { label: "Report language", value: profile.language ?? "English (UK)", icon: Mail },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 rounded-tf-md border border-border bg-surface p-4">
                <Icon className="size-4 shrink-0 text-primary" />
                <div>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-1 text-sm font-medium">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Recent login activity" description="Devices recently used for this profile.">
          <div className="grid gap-3">
            {loginActivity.map((login, index) => {
              const Icon = index === 1 ? Smartphone : Laptop;
              return (
                <div key={login.id} className="flex items-start gap-3 rounded-tf-md border border-border bg-surface p-4">
                  <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{login.device}</p>
                      {login.current && <StatusBadge tone="success">Current</StatusBadge>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{login.location}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{login.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Password controls" description="Update your password using the authenticated account flow.">
          <form onSubmit={changePassword} className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium">Current password<PasswordInput name="currentPassword" required /></label>
            <label className="grid gap-2 text-sm font-medium">New password<PasswordInput name="newPassword" required minLength={8} /></label>
            <label className="grid gap-2 text-sm font-medium">Confirm new password<PasswordInput name="confirmPassword" required minLength={8} /></label>
            <div className="flex items-center justify-end gap-3">
              {passwordSaved && <span className="inline-flex items-center gap-1.5 text-sm text-success"><Check className="size-4" /> Saved</span>}
              <Button type="submit">Validate password change</Button>
            </div>
          </form>
        </SectionCard>
      </div>

      <SectionCard
        title="Account history"
        description="Recent account records associated with this authenticated profile."
        action={
          <DemoAction variant="outline" size="sm" confirmation="Statement ready">
            <Download className="size-4" /> Download statement
          </DemoAction>
        }
        contentClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-white/[.02] text-xs text-muted-foreground">
              <tr>{["Account", "Account ID", "Created", "Platform", "Status"].map((heading) => <th key={heading} className="px-5 py-3 font-medium">{heading}</th>)}</tr>
            </thead>
            <tbody>
              {accountHistory.slice(0, 5).map((account) => (
                <tr key={account.id} className="border-b border-border/70 last:border-0">
                  <td className="px-5 py-4 font-semibold">{account.name}</td>
                  <td className="px-5 py-4 text-muted-foreground">{account.id}</td>
                  <td className="px-5 py-4 text-muted-foreground">{new Date(account.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-muted-foreground">{account.platform || "Pending"}</td>
                  <td className="px-5 py-4"><StatusBadge tone={account.status === "failed" ? "danger" : account.status === "archived" ? "neutral" : "success"}>{account.status}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
