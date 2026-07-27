"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChartLine,
  CircleDollarSign,
  Eye,
  Gauge,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const whyItems = [
  {
    title: "No hidden rules",
    description: "Every evaluation term is visible before you trade, with clear risk boundaries and account conditions.",
    icon: ShieldCheck,
  },
  {
    title: "Focus on skill, not capital",
    description: "Premium evaluation paths let you prove your edge without carrying the cost of large account capital.",
    icon: TrendingUp,
  },
  {
    title: "Professional trading environment",
    description: "A refined terminal-style interface built for disciplined decision-making and real evaluation workflows.",
    icon: ChartLine,
  },
  {
    title: "Transparent challenge conditions",
    description: "Profit targets, drawdown limits, and minimum sessions are presented as a simple, connected flow.",
    icon: Eye,
  },
];

const challenges = {
  "1-Step": [
    { size: "$5K", price: "$59", profitTarget: "10%", dailyLoss: "5%", overallLoss: "10%", minimumDays: 3 },
    { size: "$10K", price: "$109", profitTarget: "10%", dailyLoss: "5%", overallLoss: "10%", minimumDays: 3 },
    { size: "$25K", price: "$199", profitTarget: "10%", dailyLoss: "5%", overallLoss: "10%", minimumDays: 3 },
    { size: "$50K", price: "$359", profitTarget: "10%", dailyLoss: "5%", overallLoss: "10%", minimumDays: 3 },
    { size: "$100K", price: "$498", profitTarget: "10%", dailyLoss: "5%", overallLoss: "10%", minimumDays: 3 },
  ],
  "2-Step": [
    { size: "$5K", price: "$33", phase1: "8%", phase2: "5%", dailyLoss: "6%", overallLoss: "10%", minimumDays: 3 },
    { size: "$10K", price: "$69", phase1: "8%", phase2: "5%", dailyLoss: "6%", overallLoss: "10%", minimumDays: 3 },
    { size: "$25K", price: "$155", phase1: "8%", phase2: "5%", dailyLoss: "6%", overallLoss: "10%", minimumDays: 3 },
    { size: "$50K", price: "$259", phase1: "8%", phase2: "5%", dailyLoss: "6%", overallLoss: "10%", minimumDays: 3 },
    { size: "$100K", price: "$479", phase1: "8%", phase2: "5%", dailyLoss: "6%", overallLoss: "10%", minimumDays: 3 },
  ],
};

const chartData = [
  { name: "00:00", value: 42 },
  { name: "02:00", value: 45 },
  { name: "04:00", value: 43 },
  { name: "06:00", value: 50 },
  { name: "08:00", value: 48 },
  { name: "10:00", value: 54 },
  { name: "12:00", value: 52 },
  { name: "14:00", value: 56 },
  { name: "16:00", value: 58 },
  { name: "18:00", value: 55 },
];

const faqItems = [
  {
    question: "What is a 1-Step Challenge?",
    answer: "A single evaluation stage with a 10% profit target, daily and overall drawdown limits, and a minimum of 3 trading days.",
  },
  {
    question: "What is a 2-Step Challenge?",
    answer: "A two-stage path with an 8% Phase 1 target and a 5% Phase 2 target before qualification, with the same risk limits and minimum days.",
  },
  {
    question: "What are the profit targets?",
    answer: "1-Step challenges require 10% net profit. 2-Step challenges require 8% in phase one and 5% in phase two.",
  },
  {
    question: "What are the daily and overall loss limits?",
    answer: "Daily loss limits are 5% for 1-Step and 6% for 2-Step. Overall loss is capped at 10% for all challenge tiers.",
  },
  {
    question: "How are loss limits calculated?",
    answer: "Loss limits are monitored against the challenge account balance and are displayed within the challenge terms. Exact calculations are confirmed before each challenge starts.",
  },
  {
    question: "How many minimum trading days are required?",
    answer: "All challenge tiers require a minimum of 3 trading days to qualify, giving you time to trade with discipline and verify consistency.",
  },
  {
    question: "Is news trading allowed?",
    answer: "Yes. News trading is permitted under the current TradeForge evaluation rules, as long as all challenge conditions are respected.",
  },
  {
    question: "Are there any trading restrictions?",
    answer: "Challenge rules are focused on profit targets and drawdown management. Any additional trade style restrictions are shown clearly in the challenge terms.",
  },
  {
    question: "What happens after completing the challenge?",
    answer: "Successful qualification advances your account toward funded status and the funded program review.",
  },
  {
    question: "How does the funded account work?",
    answer: "Once qualified, traders enter the funded account stage with capital access and ongoing risk management. Full program terms apply.",
  },
  {
    question: "What happens if I violate a rule?",
    answer: "Rule violations pause the challenge and require review. Refer to the challenge terms and support for next-step guidance.",
  },
  {
    question: "How are payouts handled?",
    answer: "Payout details are established in the funded program agreement and depend on performance and account status.",
  },
];

function HeroTerminal() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface/90 p-6 shadow-[0_36px_90px_-45px_rgba(0,0,0,0.75)] backdrop-blur-xl">
      <div className="pointer-events-none absolute -right-8 top-8 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute left-4 top-10 h-24 w-24 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="relative z-10 grid gap-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Account balance</p>
            <p className="mt-2 text-3xl font-semibold text-white">$49,200</p>
          </div>
          <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-success">
            +4.8%
          </span>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-background/40 p-4">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Line type="monotone" dataKey="value" stroke="rgba(255,255,255,0.92)" strokeWidth={3} dot={false} strokeLinecap="round" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Open P/L</p>
            <p className="mt-3 text-xl font-semibold text-white">$12,840</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Risk status</p>
            <p className="mt-3 text-xl font-semibold text-white">Healthy</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Session pace</p>
            <p className="mt-3 text-xl font-semibold text-white">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}

type OneStepItem = {
  size: string;
  price: string;
  profitTarget: string;
  dailyLoss: string;
  overallLoss: string;
  minimumDays: number;
};

type TwoStepItem = {
  size: string;
  price: string;
  phase1: string;
  phase2: string;
  dailyLoss: string;
  overallLoss: string;
  minimumDays: number;
};

type ChallengeItem = OneStepItem | TwoStepItem;

function ChallengeCard({ challengeType, item }: { challengeType: "1-Step" | "2-Step"; item: ChallengeItem }) {
  const nodes =
    challengeType === "1-Step"
      ? [
          { label: "Profit Target", value: (item as OneStepItem).profitTarget },
          { label: "Daily Loss Limit", value: item.dailyLoss },
          { label: "Overall Loss Limit", value: item.overallLoss },
          { label: "Minimum Trading Days", value: `${item.minimumDays}` },
        ]
      : [
          { label: "Phase 1 target", value: (item as TwoStepItem).phase1 },
          { label: "Phase 2 target", value: (item as TwoStepItem).phase2 },
          { label: "Daily loss limit", value: item.dailyLoss },
          { label: "Overall loss limit", value: item.overallLoss },
        ];

  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface/90 p-6 shadow-[0_30px_70px_-38px_rgba(0,0,0,0.55)] transition duration-300 ease-out hover:-translate-y-1 hover:border-white/15 hover:shadow-[0_36px_86px_-40px_rgba(0,0,0,0.6)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/40 via-transparent to-cyan-400/30 opacity-60" />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">{item.size}</p>
          <p className="mt-3 text-4xl font-semibold text-white">{item.price}</p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          {challengeType}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Profit target</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {challengeType === "1-Step"
              ? (item as OneStepItem).profitTarget
              : `${(item as TwoStepItem).phase1} / ${(item as TwoStepItem).phase2}`}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Risk limits</p>
          <p className="mt-2 text-lg font-semibold text-white">{item.dailyLoss} / {item.overallLoss}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Days required</p>
          <p className="mt-2 text-lg font-semibold text-white">{item.minimumDays}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Probability profile</p>
          <p className="mt-2 text-lg font-semibold text-white">Structured evaluation</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {nodes.map((node, index) => (
          <div key={node.label} className="flex items-start gap-3">
            <div className="relative flex h-3 w-3 items-center justify-center">
              <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
              {index < nodes.length - 1 && <span className="absolute left-1/2 top-4 h-full w-px bg-white/10" />}
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 flex-1">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{node.label}</p>
              <p className="mt-2 text-base font-semibold text-white">{node.value}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export function HomePage() {
  const [activeTab, setActiveTab] = useState<"1-Step" | "2-Step">("1-Step");

  return (
    <div className="relative overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top_left,_rgba(115,87,255,.18),transparent_36%),radial-gradient(circle_at_top_right,_rgba(63,190,255,.12),transparent_30%)] blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-80 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative mx-auto flex max-w-[1400px] flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-8 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-tf-lg bg-primary-solid text-sm font-bold text-primary-solid-foreground shadow-glow">
              T
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">TradeForge</p>
              <p className="text-xs text-muted-foreground">Premium trading evaluation</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground sm:gap-6">
            <a href="#challenges" className="transition hover:text-white focus:text-white">Challenges</a>
            <a href="#faq" className="transition hover:text-white focus:text-white">FAQ</a>
            <Link href="/search?q=help" className="transition hover:text-white focus:text-white">Support</Link>
          </nav>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/">Sign In</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="#challenges">Start Your Challenge</Link>
            </Button>
          </div>
        </header>

        <main className="relative mt-16 grid gap-16 xl:grid-cols-[0.95fr_1.05fr] xl:items-center">
          <section className="max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-primary shadow-[0_15px_45px_-35px_rgba(59,130,246,0.65)]">
              Premium fintech × institutional evaluation
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl font-semibold leading-[1.02] tracking-[-0.03em] text-white sm:text-6xl">
                Trade with precision. Qualify with confidence.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                A premium challenge gateway designed for serious traders who want transparency, discipline, and a modern evaluation experience.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button asChild size="lg">
                <Link href="#challenges">Start Your Challenge</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#challenges">Explore Challenges</Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Fast decisions</p>
                <p className="mt-3 text-2xl font-semibold text-white">Live-progress dashboards</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Clarity first</p>
                <p className="mt-3 text-2xl font-semibold text-white">Rule flow built for traders</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Premium feel</p>
                <p className="mt-3 text-2xl font-semibold text-white">Terminal-grade presentation</p>
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="absolute inset-x-0 top-0 -z-10 h-[420px] rounded-[2rem] bg-gradient-to-br from-primary/15 via-transparent to-cyan-500/5 blur-3xl" />
            <div className="rounded-[2rem] border border-white/10 bg-surface/90 p-6 shadow-[0_40px_100px_-48px_rgba(0,0,0,.65)] backdrop-blur-xl">
              <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-background/80 p-6 shadow-[0_20px_40px_-20px_rgba(0,0,0,.35)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Trader terminal</p>
                    <p className="mt-2 text-2xl font-semibold text-white">Live risk and account pulse</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    Connected
                  </span>
                </div>
                <HeroTerminal />
              </div>
            </div>
          </section>
        </main>

        <section className="mt-24" id="why">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.3em] text-primary">Why TradeForge</p>
              <h2 className="mt-3 text-4xl font-semibold text-white">The clarity you need to trade better.</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground">
              Designed for disciplined traders who want premium execution, transparent evaluation, and a trusted path to funded capital.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-4">
            {whyItems.map((item) => (
              <div
                key={item.title}
                className="group rounded-[1.75rem] border border-white/10 bg-white/5 p-6 transition duration-300 ease-out hover:-translate-y-1 hover:border-white/15 hover:bg-white/10"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                  <item.icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24" id="challenges">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-primary">Challenges</p>
              <h2 className="mt-3 text-4xl font-semibold text-white">Choose the path that fits your edge.</h2>
            </div>
            <div className="inline-flex rounded-full bg-white/5 p-1 shadow-[0_24px_50px_-40px_rgba(255,255,255,0.3)]">
              {(["1-Step", "2-Step"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setActiveTab(option)}
                  className={cn(
                    "rounded-full px-5 py-2 text-sm font-semibold transition duration-300",
                    activeTab === option
                      ? "bg-white text-background shadow-glow"
                      : "text-muted-foreground hover:text-white",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Exact evaluation costs and risk limits shown for every tier. Pick the account size that matches your strategy and start trading with confidence.
          </p>

          <div className="mt-10 grid gap-6 xl:grid-cols-2">
            <div className="space-y-6">
              {challenges[activeTab].map((item) => (
                <ChallengeCard key={item.size} challengeType={activeTab} item={item} />
              ))}
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-surface/90 p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,.55)]">
              <div className="flex items-center gap-3 rounded-[1.5rem] bg-primary/10 p-4">
                <ShieldCheck className="size-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-white">Rules at a glance</p>
                  <p className="text-sm text-muted-foreground">A focused view of the evaluation flow for each challenge type.</p>
                </div>
              </div>
              <div className="mt-8 space-y-6">
                <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">1-Step</p>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                      <span>Profit Target</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                      <span>Daily Loss Limit</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                      <span>Overall Loss Limit</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                      <span>Minimum Trading Days</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">2-Step</p>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                      <span>Phase 1 profit target</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                      <span>Phase 2 profit target</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                      <span>Funded review</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Minimum trading days</p>
                  <p className="mt-2 text-lg font-semibold text-white">3 days</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-24" id="how">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-primary">How it works</p>
              <h2 className="mt-3 text-4xl font-semibold text-white">A premium path from challenge to funded account.</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground">
              Four simple stages, presented as a refined trading flow with clear expectations at every step.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-4">
            {[
              { label: "Choose", description: "Pick the challenge size and evaluation path that fits your strategy.", icon: Zap },
              { label: "Trade", description: "Trade with discipline inside the defined daily and overall risk boundaries.", icon: ChartLine },
              { label: "Qualify", description: "Reach the required target while protecting your evaluation account.", icon: Gauge },
              { label: "Funded", description: "Move toward funded capital and establish your next trading stage.", icon: CircleDollarSign },
            ].map((item, index) => (
              <div
                key={item.label}
                className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-white transition duration-300 ease-out hover:-translate-y-1 hover:border-white/15"
              >
                <div className="absolute inset-x-6 top-6 h-1 rounded-full bg-primary/20" />
                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                    <item.icon className="size-5" aria-hidden="true" />
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                  </span>
                </div>
                <h3 className="mt-8 text-xl font-semibold">{item.label}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24" id="feedback">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-primary">Trader feedback</p>
              <h2 className="mt-3 text-4xl font-semibold text-white">A premium waiting room for trader stories.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                Complete your challenge, experience TradeForge, and be among the first traders to share your story.
              </p>
            </div>
            <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-10 text-center shadow-[0_36px_90px_-48px_rgba(0,0,0,.55)]">
              <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="size-7" aria-hidden="true" />
              </div>
              <p className="mt-8 text-lg font-semibold text-white">Trader feedback coming soon</p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                The community experience is maturing alongside TradeForge. Your first funding stories will shape the next chapter.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button asChild size="sm">
                  <Link href="#challenges">Take the challenge</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="#feedback">Share your experience</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-24" id="faq">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-primary">FAQ</p>
              <h2 className="mt-3 text-4xl font-semibold text-white">Questions answered clearly.</h2>
            </div>
          </div>

          <div className="mt-10 grid gap-4 xl:grid-cols-2">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group rounded-[1.75rem] border border-white/10 bg-white/5 p-6 transition duration-300 ease-out [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-white">
                  {item.question}
                  <ArrowUpRight className="size-4 text-muted-foreground transition-transform duration-300 group-open:rotate-45" />
                </summary>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-24 rounded-[2rem] border border-white/10 bg-surface/95 p-10 text-center shadow-[0_40px_100px_-50px_rgba(0,0,0,.55)]">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Ready to trade with purpose?</p>
          <h2 className="mt-4 text-4xl font-semibold text-white">Launch your challenge with premium clarity.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Start your challenge with transparent evaluation rules and a refined terminal-style experience.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="#challenges">Start Your Challenge</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">Sign In</Link>
            </Button>
          </div>
        </section>

        <footer className="mt-24 border-t border-white/10 pt-8 pb-10 text-sm text-muted-foreground">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-white">TradeForge</p>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Premium challenge evaluation and funded trading experience with a focus on clarity, trust, and disciplined risk management.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <a href="#challenges" className="transition hover:text-white">Challenges</a>
              <a href="#faq" className="transition hover:text-white">FAQ</a>
              <Link href="/search?q=help" className="transition hover:text-white">Support</Link>
            </div>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">All challenge conditions are subject to the TradeForge evaluation terms. This landing page is built to support premium trader discovery and evaluation flow.</p>
        </footer>
      </div>
    </div>
  );
}
