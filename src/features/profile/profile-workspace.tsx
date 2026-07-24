"use client";

import { FormEvent, useState } from "react";
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
import { accounts, loginActivity, workspaceUser } from "@/features/workspace/mock-data";

export function ProfileWorkspace() {
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileSaved(true);
  }

  function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordSaved(true);
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Profile"
        title="Your profile"
        description="Keep contact details, trading preferences, security context, and demo account records accurate."
        action={
          <DemoAction confirmation="Demo profile exported">
            <Download className="size-4" /> Download profile
          </DemoAction>
        }
      />

      <div className="grid gap-6 xl:grid-cols-12">
        <SectionCard className="xl:col-span-8" contentClassName="p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="grid size-16 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/15 font-display text-lg font-bold text-primary">
              {workspaceUser.initials}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl">{workspaceUser.name}</h2>
                <StatusBadge tone="success">{workspaceUser.verification}</StatusBadge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{workspaceUser.level}</p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" /> Member since {workspaceUser.memberSince}</span>
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> {workspaceUser.kycStatus}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Primary account", "Apex Evaluation 100K"],
              ["Trader level", workspaceUser.level],
              ["Verification", workspaceUser.verification],
              ["KYC status", "Demo verified"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-tf-md border border-border bg-surface p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-2 text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Security summary" description="Current demo account posture." className="xl:col-span-4">
          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-4 rounded-tf-md border border-success/20 bg-success/10 p-4">
              <span className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="size-4 text-success" /> Identity record</span>
              <span className="text-xs text-success">Verified demo</span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-tf-md border border-border bg-surface p-4">
              <span className="flex items-center gap-2 text-sm font-medium"><KeyRound className="size-4 text-primary" /> Two-factor auth</span>
              <span className="text-xs text-warning">Not enabled</span>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">Last password update: 14 June 2026.</p>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <SectionCard title="Personal information" description="Demo contact and regional preferences." className="xl:col-span-8">
          <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">First name<Input defaultValue="Alex" /></label>
            <label className="grid gap-2 text-sm font-medium">Last name<Input defaultValue="Morgan" /></label>
            <label className="grid gap-2 text-sm font-medium">Email<Input type="email" defaultValue={workspaceUser.email} /></label>
            <label className="grid gap-2 text-sm font-medium">Phone<Input type="tel" defaultValue={workspaceUser.phone} /></label>
            <label className="grid gap-2 text-sm font-medium">
              Country
              <select className="h-11 rounded-tf-md border border-border bg-surface px-3 text-sm text-foreground" defaultValue={workspaceUser.country}>
                <option>United Kingdom</option><option>India</option><option>United Arab Emirates</option><option>United States</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Timezone
              <select className="h-11 rounded-tf-md border border-border bg-surface px-3 text-sm text-foreground" defaultValue={workspaceUser.timezone}>
                <option>Europe/London (UTC+1)</option><option>Asia/Kolkata (UTC+5:30)</option><option>America/New_York (UTC-4)</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium sm:col-span-2">
              Language
              <select className="h-11 rounded-tf-md border border-border bg-surface px-3 text-sm text-foreground" defaultValue={workspaceUser.language}>
                <option>English (UK)</option><option>English (US)</option><option>Hindi</option>
              </select>
            </label>
            <div className="flex items-center justify-end gap-3 sm:col-span-2">
              {profileSaved && <span className="inline-flex items-center gap-1.5 text-sm text-success"><Check className="size-4" /> Saved locally</span>}
              <Button type="submit">Save profile</Button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Trading preferences" description="Used to personalise demo summaries." className="xl:col-span-4">
          <dl className="grid gap-4">
            {[
              { label: "Primary session", value: "London open", icon: Globe2 },
              { label: "Preferred markets", value: "FX majors, XAU/USD", icon: MapPin },
              { label: "Risk per trade", value: "0.50% target", icon: ShieldCheck },
              { label: "Report language", value: "English (UK)", icon: Mail },
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
        <SectionCard title="Recent login activity" description="Devices recently used for this demo profile.">
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

        <SectionCard title="Password controls" description="Demo validation only; no backend credential is changed.">
          <form onSubmit={changePassword} className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium">Current password<PasswordInput required /></label>
            <label className="grid gap-2 text-sm font-medium">New password<PasswordInput required minLength={8} /></label>
            <label className="grid gap-2 text-sm font-medium">Confirm new password<PasswordInput required minLength={8} /></label>
            <div className="flex items-center justify-end gap-3">
              {passwordSaved && <span className="inline-flex items-center gap-1.5 text-sm text-success"><Check className="size-4" /> Demo validated</span>}
              <Button type="submit">Validate password change</Button>
            </div>
          </form>
        </SectionCard>
      </div>

      <SectionCard
        title="Account history"
        description="Statements and account lifecycle records."
        action={
          <DemoAction variant="outline" size="sm" confirmation="Demo statement ready">
            <Download className="size-4" /> Download statement
          </DemoAction>
        }
        contentClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-white/[.02] text-xs text-muted-foreground">
              <tr>{["Account", "Account ID", "Created", "Last activity", "Status"].map((heading) => <th key={heading} className="px-5 py-3 font-medium">{heading}</th>)}</tr>
            </thead>
            <tbody>
              {accounts.slice(0, 5).map((account) => (
                <tr key={account.id} className="border-b border-border/70 last:border-0">
                  <td className="px-5 py-4 font-semibold">{account.name}</td>
                  <td className="px-5 py-4 text-muted-foreground">{account.id}</td>
                  <td className="px-5 py-4 text-muted-foreground">{account.createdAt}</td>
                  <td className="px-5 py-4 text-muted-foreground">{account.lastActivity}</td>
                  <td className="px-5 py-4"><StatusBadge tone={account.status === "Failed" ? "danger" : account.status === "Archived" ? "neutral" : "success"}>{account.status}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
