"use client";

import { FormEvent, useState } from "react";
import {
  Bell,
  Check,
  Eye,
  Globe2,
  KeyRound,
  Laptop,
  Link2,
  LockKeyhole,
  Mail,
  MonitorCog,
  Palette,
  Save,
  ShieldAlert,
  SlidersHorizontal,
  Smartphone,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/control";
import { PasswordInput } from "@/components/ui/input";
import { DemoAction } from "@/components/workspace/demo-action";
import { PageHeader } from "@/components/workspace/page-header";
import { SectionCard } from "@/components/workspace/section-card";
import { StatusBadge } from "@/components/workspace/status-badge";
import { loginActivity } from "@/features/workspace/mock-data";

type PreferenceKey =
  | "challengeUpdates"
  | "ruleAlerts"
  | "payoutUpdates"
  | "productEmail"
  | "weeklyReport"
  | "securityEmail"
  | "performanceAnalytics"
  | "sessionReminders"
  | "privacyAnalytics";

function SelectControl({ label, defaultValue, children }: { label: string; defaultValue: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <select defaultValue={defaultValue} className="h-11 rounded-tf-md border border-border bg-surface px-3 text-sm text-foreground">
        {children}
      </select>
    </label>
  );
}

export function SettingsWorkspace() {
  const [saved, setSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [preferences, setPreferences] = useState<Record<PreferenceKey, boolean>>({
    challengeUpdates: true,
    ruleAlerts: true,
    payoutUpdates: true,
    productEmail: false,
    weeklyReport: true,
    securityEmail: true,
    performanceAnalytics: true,
    sessionReminders: false,
    privacyAnalytics: false,
  });

  function updatePreference(key: PreferenceKey, value: boolean) {
    setPreferences((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordSaved(true);
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Settings"
        title="Workspace settings"
        description="Control notifications, appearance, trading preferences, privacy, and security for this local demo workspace."
        action={
          <Button type="button" onClick={() => setSaved(true)}>
            {saved ? <Check className="size-4" /> : <Save className="size-4" />}
            {saved ? "Saved locally" : "Save preferences"}
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="General preferences" description="Regional and display defaults." action={<Globe2 className="size-5 text-primary" />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectControl label="Language" defaultValue="English (UK)">
              <option>English (UK)</option><option>English (US)</option><option>Hindi</option>
            </SelectControl>
            <SelectControl label="Currency display" defaultValue="USD">
              <option>USD</option><option>GBP</option><option>EUR</option><option>INR</option>
            </SelectControl>
            <SelectControl label="Timezone" defaultValue="Europe/London (UTC+1)">
              <option>Europe/London (UTC+1)</option><option>Asia/Kolkata (UTC+5:30)</option><option>America/New_York (UTC-4)</option>
            </SelectControl>
            <SelectControl label="Date format" defaultValue="DD MMM YYYY">
              <option>DD MMM YYYY</option><option>MMM DD, YYYY</option><option>YYYY-MM-DD</option>
            </SelectControl>
          </div>
        </SectionCard>

        <SectionCard title="Appearance" description="A focused dark interface is the current TradeForge default." action={<Palette className="size-5 text-primary" />}>
          <div className="grid gap-4">
            <SelectControl label="Theme" defaultValue="Dark">
              <option>Dark</option><option>System (dark preview)</option>
            </SelectControl>
            <SelectControl label="Information density" defaultValue="Comfortable">
              <option>Comfortable</option><option>Compact</option>
            </SelectControl>
            <div className="rounded-tf-md border border-border bg-surface p-4">
              <p className="text-sm font-medium">Preview</p>
              <div className="mt-3 flex gap-2">
                <span className="h-12 flex-1 rounded-tf-sm border border-primary/40 bg-background" />
                <span className="h-12 flex-1 rounded-tf-sm border border-border bg-card" />
                <span className="h-12 flex-1 rounded-tf-sm bg-primary/20" />
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Notification preferences" description="Account and challenge updates." action={<Bell className="size-5 text-primary" />}>
          <div className="grid gap-4">
            <Switch label="Challenge and evaluation updates" checked={preferences.challengeUpdates} onCheckedChange={(value) => updatePreference("challengeUpdates", value)} />
            <Switch label="Daily and overall rule alerts" checked={preferences.ruleAlerts} onCheckedChange={(value) => updatePreference("ruleAlerts", value)} />
            <Switch label="Payout eligibility and request updates" checked={preferences.payoutUpdates} onCheckedChange={(value) => updatePreference("payoutUpdates", value)} />
          </div>
        </SectionCard>

        <SectionCard title="Email preferences" description="Messages sent to the demo profile." action={<Mail className="size-5 text-primary" />}>
          <div className="grid gap-4">
            <Switch label="Product and workspace updates" checked={preferences.productEmail} onCheckedChange={(value) => updatePreference("productEmail", value)} />
            <Switch label="Weekly performance report" checked={preferences.weeklyReport} onCheckedChange={(value) => updatePreference("weeklyReport", value)} />
            <Switch label="Security and sign-in alerts" checked={preferences.securityEmail} onCheckedChange={(value) => updatePreference("securityEmail", value)} />
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Trading preferences" description="Used for local insights and reporting." action={<SlidersHorizontal className="size-5 text-primary" />}>
          <div className="grid gap-4">
            <SelectControl label="Primary trading session" defaultValue="London open">
              <option>London open</option><option>New York open</option><option>Asia session</option>
            </SelectControl>
            <SelectControl label="Default chart range" defaultValue="1 month">
              <option>7 days</option><option>1 month</option><option>3 months</option>
            </SelectControl>
            <Switch label="Performance analytics" checked={preferences.performanceAnalytics} onCheckedChange={(value) => updatePreference("performanceAnalytics", value)} />
            <Switch label="Pre-session risk reminders" checked={preferences.sessionReminders} onCheckedChange={(value) => updatePreference("sessionReminders", value)} />
          </div>
        </SectionCard>

        <SectionCard title="Risk preferences" description="Personal guardrails do not replace evaluation rules." action={<ShieldAlert className="size-5 text-warning" />}>
          <div className="grid gap-4">
            <SelectControl label="Personal risk per trade" defaultValue="0.50%">
              <option>0.25%</option><option>0.50%</option><option>0.75%</option><option>1.00%</option>
            </SelectControl>
            <SelectControl label="Daily personal stop" defaultValue="1.50%">
              <option>1.00%</option><option>1.50%</option><option>2.00%</option>
            </SelectControl>
            <label className="grid gap-2 text-sm font-medium">
              Consistency alert threshold
              <input type="range" min="20" max="80" defaultValue="45" className="h-11 w-full accent-[hsl(var(--primary))]" />
              <span className="text-xs font-normal text-muted-foreground">Notify when one day contributes more than 45% of total profit.</span>
            </label>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <SectionCard title="Password controls" description="Local form validation only." className="xl:col-span-7" action={<KeyRound className="size-5 text-primary" />}>
          <form onSubmit={savePassword} className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium">Current password<PasswordInput required /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">New password<PasswordInput required minLength={8} /></label>
              <label className="grid gap-2 text-sm font-medium">Confirm password<PasswordInput required minLength={8} /></label>
            </div>
            <div className="flex items-center justify-end gap-3">
              {passwordSaved && <span className="inline-flex items-center gap-1.5 text-sm text-success"><Check className="size-4" /> Demo validated</span>}
              <Button type="submit">Validate password change</Button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Two-factor authentication" description="Production integration placeholder." className="xl:col-span-5" action={<LockKeyhole className="size-5 text-primary" />}>
          <div className="rounded-tf-md border border-warning/20 bg-warning/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">Not enabled</p>
              <StatusBadge tone="warning">Placeholder</StatusBadge>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">A secure backend and recovery-code flow are required before enabling 2FA.</p>
          </div>
          <DemoAction variant="outline" className="mt-4 w-full" confirmation="Demo 2FA setup opened">Preview setup</DemoAction>
        </SectionCard>
      </div>

      <SectionCard title="Active sessions" description="Review and revoke demo device sessions." action={<MonitorCog className="size-5 text-primary" />}>
        <div className="grid gap-3">
          {loginActivity.map((session, index) => {
            const Icon = index === 1 ? Smartphone : Laptop;
            return (
              <div key={session.id} className="flex flex-col gap-3 rounded-tf-md border border-border bg-surface p-4 sm:flex-row sm:items-center">
                <Icon className="size-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{session.device}</p>
                    {session.current && <StatusBadge tone="success">Current session</StatusBadge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{session.location} · {session.timestamp}</p>
                </div>
                {!session.current && <DemoAction variant="outline" size="sm" confirmation="Demo session revoked">Revoke</DemoAction>}
              </div>
            );
          })}
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Privacy" description="Local analytics and account visibility." action={<Eye className="size-5 text-primary" />}>
          <div className="grid gap-4">
            <Switch label="Share anonymous usage analytics" checked={preferences.privacyAnalytics} onCheckedChange={(value) => updatePreference("privacyAnalytics", value)} />
            <label className="grid gap-2 text-sm font-medium">
              Leaderboard visibility
              <select defaultValue="Alias only" className="h-11 rounded-tf-md border border-border bg-surface px-3 text-sm text-foreground">
                <option>Alias only</option><option>Hidden</option>
              </select>
            </label>
            <DemoAction variant="outline" confirmation="Demo archive prepared">Request demo data archive</DemoAction>
          </div>
        </SectionCard>

        <SectionCard title="Connected apps" description="No production integrations are connected." action={<Link2 className="size-5 text-primary" />}>
          <div className="grid min-h-36 place-items-center rounded-tf-md border border-dashed border-border bg-surface p-5 text-center">
            <div>
              <Link2 className="mx-auto size-6 text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold">No connected apps</p>
              <p className="mt-1 text-sm text-muted-foreground">Third-party connections require a reviewed OAuth flow.</p>
            </div>
          </div>
          <DemoAction variant="outline" className="mt-4 w-full" confirmation="Demo catalogue opened">Browse demo integrations</DemoAction>
        </SectionCard>
      </div>

      <SectionCard title="Danger zone" description="These controls are intentionally non-destructive in the frontend demo." action={<Trash2 className="size-5 text-danger" />} className="border-danger/30">
        <div className="flex flex-col justify-between gap-4 rounded-tf-md border border-danger/20 bg-danger/10 p-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold">Close demo workspace account</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Production closure would require identity confirmation, open-request checks, and a recovery period.</p>
          </div>
          <DemoAction variant="danger" confirmation="No account was closed">Preview closure</DemoAction>
        </div>
      </SectionCard>
    </div>
  );
}
