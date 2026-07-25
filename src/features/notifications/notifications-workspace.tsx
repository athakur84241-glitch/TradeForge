"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  CircleDollarSign,
  Filter,
  Info,
  ShieldAlert,
  Trophy,
  UserRoundCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/workspace/page-header";
import { StatusBadge } from "@/components/workspace/status-badge";
import { notifications as initialNotifications } from "@/features/workspace/mock-data";
import type { WorkspaceNotification } from "@/features/workspace/types";

const categories = ["All", "Account", "Rule alert", "Payout", "Challenge", "System"] as const;
type Category = (typeof categories)[number];

const iconByCategory = {
  Account: UserRoundCheck,
  "Rule alert": ShieldAlert,
  Payout: CircleDollarSign,
  Challenge: Trophy,
  System: Info,
} satisfies Record<WorkspaceNotification["category"], typeof Bell>;

export function NotificationsWorkspace() {
  const [items, setItems] = useState(initialNotifications);
  const [category, setCategory] = useState<Category>("All");

  const visible = useMemo(
    () => items.filter((item) => category === "All" || item.category === category),
    [category, items],
  );
  const unreadCount = items.filter((item) => item.unread).length;

  function publishUnreadCount(count: number) {
    window.dispatchEvent(new CustomEvent<number>("tradeforge:notification-count", { detail: count }));
  }

  function markRead(id: string) {
    setItems((current) => {
      const next = current.map((item) => item.id === id ? { ...item, unread: false } : item);
      publishUnreadCount(next.filter((item) => item.unread).length);
      return next;
    });
  }

  function markAllRead() {
    setItems((current) => current.map((item) => ({ ...item, unread: false })));
    publishUnreadCount(0);
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Notifications"
        title="Workspace updates"
        description={`${unreadCount} unread update${unreadCount === 1 ? "" : "s"} across account events, rules, payouts, and challenge progress.`}
        action={
          <Button type="button" variant="outline" disabled={unreadCount === 0} onClick={markAllRead}>
            <CheckCheck className="size-4" /> Mark all as read
          </Button>
        }
      />

      <section className="overflow-hidden rounded-tf-lg border border-border bg-card" aria-labelledby="notification-list-title">
        <div className="flex flex-col justify-between gap-4 border-b border-border p-5 sm:flex-row sm:items-center">
          <div>
            <h2 id="notification-list-title" className="text-base font-semibold">Notification centre</h2>
            <p className="mt-1 text-sm text-muted-foreground">Updates are stored locally for this demo session.</p>
          </div>
          <label className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <span className="sr-only">Filter notification category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as Category)}
              className="h-10 min-w-48 rounded-tf-md border border-border bg-surface pl-10 pr-3 text-sm text-foreground"
            >
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <div>
          {visible.map((notification) => {
            const Icon = iconByCategory[notification.category];
            return (
              <article
                key={notification.id}
                className={`flex flex-col gap-4 border-b border-border/70 p-5 last:border-0 sm:flex-row sm:items-start ${
                  notification.unread ? "bg-primary/[.035]" : ""
                }`}
              >
                <span className={`grid size-10 shrink-0 place-items-center rounded-tf-md ${
                  notification.unread ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start gap-2">
                    <h3 className="text-sm font-semibold">{notification.title}</h3>
                    {notification.unread && <span className="mt-1.5 size-2 rounded-full bg-primary" aria-label="Unread" />}
                  </div>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{notification.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <StatusBadge tone={notification.category === "Rule alert" ? "warning" : "primary"} icon={false}>{notification.category}</StatusBadge>
                    <time className="text-xs text-muted-foreground">{notification.timestamp}</time>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {notification.unread && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => markRead(notification.id)}>Mark read</Button>
                  )}
                  <Button asChild variant="outline" size="sm">
                    <Link href={notification.href}>Open</Link>
                  </Button>
                </div>
              </article>
            );
          })}
          {visible.length === 0 && (
            <div className="grid min-h-56 place-items-center p-6 text-center">
              <div>
                <Bell className="mx-auto size-7 text-muted-foreground" />
                <p className="mt-3 font-semibold">No updates in this category</p>
                <p className="mt-2 text-sm text-muted-foreground">Choose another category to view workspace events.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
