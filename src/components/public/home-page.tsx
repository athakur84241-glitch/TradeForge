"use client";

import { useEffect, useState } from "react";
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
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
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
  const [marketPulse, setMarketPulse] = useState(0);
  const [balance, setBalance] = useState(49200);
  const [change, setChange] = useState(4.8);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMarketPulse((value) => value + 1);
      setBalance((value) => value + (Math.random() > 0.5 ? 70 : -48));
      setChange((value) => {
        const nextValue = value + (Math.random() > 0.5 ? 0.12 : -0.08);
        return Number(Math.min(6.2, Math.max(2.4, nextValue)).toFixed(1));
      });
    }, 1800);

    return () => window.clearInterval(interval);
  }, []);

  const animatedChartData = chartData.map((point, index) => {
    const drift = index % 4 === 0 ? 1.4 : index % 4 === 1 ? -0.6 : index % 4 === 2 ? 1.1 : -0.3;
    const pulseShift = marketPulse % 2 === 0 ? 0.8 : -0.4;
    return {
      ...point,
      value: Math.min(62, Math.max(34, point.value + drift + pulseShift)),
    };
  });

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] p-5 shadow-[0_36px_90px_-45px_rgba(0,0,0,0.75)] backdrop-blur-xl sm:p-6">
      <div className="pointer-events-none absolute -right-8 top-8 h-36 w-36 rounded-full bg-primary/12 blur-3xl" />
      <div className="pointer-events-none absolute left-4 top-10 h-24 w-24 rounded-full bg-cyan-500/12 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-primary/10 to-transparent" />
      <div className="relative z-10 grid gap-4 sm:gap-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Account balance</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-white">${balance.toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-success">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
            </span>
            +{change.toFixed(1)}%
          </div>
        </div>

        <div className="rounded-[1.45rem] border border-white/10 bg-background/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
            <span>EURUSD</span>
            <span>14:32 UTC</span>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={animatedChartData}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
                    <stop offset="100%" stopColor="rgba(120,87,255,0.18)" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }} dy={8} />
                <YAxis hide />
                <Area type="monotone" dataKey="value" stroke="rgba(255,255,255,0.95)" strokeWidth={2.3} fill="url(#chartGradient)" dot={false} isAnimationActive animationDuration={650} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4 shadow-[0_10px_28px_-20px_rgba(0,0,0,0.8)] transition duration-300 hover:-translate-y-0.5 hover:border-white/15">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Open P/L</p>
            <p className="mt-3 text-xl font-semibold text-white">$12,840</p>
          </div>
          <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4 shadow-[0_10px_28px_-20px_rgba(0,0,0,0.8)] transition duration-300 hover:-translate-y-0.5 hover:border-white/15">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Risk status</p>
            <p className="mt-3 text-xl font-semibold text-white">Healthy</p>
          </div>
          <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4 shadow-[0_10px_28px_-20px_rgba(0,0,0,0.8)] transition duration-300 hover:-translate-y-0.5 hover:border-white/15">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Session pace</p>
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
  const isOneStep = challengeType === "1-Step";
  const profitTarget = isOneStep ? (item as OneStepItem).profitTarget : `${(item as TwoStepItem).phase1} / ${(item as TwoStepItem).phase2}`;
  const primaryLabel = isOneStep ? "Profit target" : "Phase targets";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] p-4 shadow-[0_22px_50px_-28px_rgba(0,0,0,0.72)] transition duration-300 ease-out hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_28px_70px_-24px_rgba(120,87,255,0.38)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">{item.size}</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-white">{item.price}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
          {challengeType}
        </span>
      </div>

      <div className="mt-5 rounded-[1.2rem] border border-white/10 bg-background/40 p-3.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{primaryLabel}</span>
          <span className="font-semibold text-white">{profitTarget}</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Daily loss</span>
          <span className="font-semibold text-white">{item.dailyLoss}</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Overall loss</span>
          <span className="font-semibold text-white">{item.overallLoss}</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Min trading days</span>
          <span className="font-semibold text-white">{item.minimumDays}</span>
        </div>
      </div>

      <div className="mt-5">
        <button
          type="button"
          className="inline-flex w-full items-center justify-center rounded-full border border-primary/20 bg-primary/10 px-3 py-2.5 text-sm font-semibold text-primary transition duration-300 group-hover:-translate-y-0.5 group-hover:bg-primary/20"
        >
          Buy Challenge
        </button>
      </div>
    </article>
  );
}

export function HomePage() {
  const [activeTab, setActiveTab] = useState<"1-Step" | "2-Step">("1-Step");

  return (
    <div className="relative overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[760px] bg-[radial-gradient(circle_at_12%_0%,rgba(120,87,255,0.26),transparent_32%),radial-gradient(circle_at_88%_8%,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.09),transparent_54%)] blur-3xl" />
      <div className="pointer-events-none absolute left-[5%] top-[12%] h-[22rem] w-[22rem] rounded-full bg-primary/16 blur-[140px] animate-[pulse_14s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute right-[9%] top-[15%] h-[20rem] w-[20rem] rounded-full bg-sky-500/12 blur-[140px] animate-[pulse_18s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute bottom-[6%] left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[150px] animate-[pulse_20s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.035)_48%,transparent_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-90 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:120px_120px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,87,255,0.08),transparent_30%),radial-gradient(circle_at_70%_70%,rgba(59,130,246,0.08),transparent_24%)] animate-[pulse_22s_ease-in-out_infinite]" />
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
          <section className="relative max-w-2xl lg:pr-10">
            <div className="pointer-events-none absolute -left-8 top-6 h-56 w-56 rounded-full bg-primary/8 blur-[110px]" />
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-primary shadow-[0_15px_45px_-35px_rgba(59,130,246,0.65)]">
              Premium fintech × institutional evaluation
            </div>

            <div className="mt-7 space-y-6">
              <h1 className="max-w-[760px] text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl lg:text-[4.35rem]">
                Trade with precision. Qualify with confidence.
              </h1>
              <p className="max-w-[640px] text-lg leading-8 text-muted-foreground/95 sm:text-xl">
                A premium challenge gateway designed for serious traders who want transparency, discipline, and a modern evaluation experience.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="rounded-full border border-primary/30 bg-gradient-to-r from-primary via-primary/90 to-sky-500/80 px-6 py-3.5 text-white shadow-[0_24px_70px_-24px_rgba(120,87,255,0.6)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_-22px_rgba(120,87,255,0.7)]">
                <Link href="#challenges">Start Your Challenge</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full border-white/15 bg-white/[0.04] px-6 py-3.5 text-white transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-primary/10">
                <Link href="#challenges">Explore Challenges</Link>
              </Button>
            </div>

            <div className="mt-8 rounded-[1.85rem] border border-white/10 bg-white/[0.03] p-3 shadow-[0_24px_70px_-40px_rgba(0,0,0,0.8)]">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.25rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition duration-300 hover:-translate-y-1 hover:border-primary/25">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Fast decisions</p>
                  <p className="mt-3 text-2xl font-semibold text-white">Live-progress dashboards</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition duration-300 hover:-translate-y-1 hover:border-primary/25">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Clarity first</p>
                  <p className="mt-3 text-2xl font-semibold text-white">Rule flow built for traders</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition duration-300 hover:-translate-y-1 hover:border-primary/25">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Premium feel</p>
                  <p className="mt-3 text-2xl font-semibold text-white">Terminal-grade presentation</p>
                </div>
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
                className="group rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.75)] transition duration-300 ease-out hover:-translate-y-1 hover:border-primary/25 hover:bg-white/[0.085] hover:shadow-[0_28px_60px_-28px_rgba(120,87,255,0.32)]"
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

          <div className="mt-10">
            <div className="grid gap-4 lg:grid-cols-5 xl:grid-cols-5">
              {challenges[activeTab].map((item) => (
                <ChallengeCard key={item.size} challengeType={activeTab} item={item} />
              ))}
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
                className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-white shadow-[0_16px_36px_-24px_rgba(0,0,0,0.72)] transition duration-300 ease-out hover:-translate-y-1 hover:border-primary/25 hover:bg-white/[0.085] hover:shadow-[0_24px_50px_-24px_rgba(120,87,255,0.3)]"
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
            <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-10 text-center shadow-[0_36px_90px_-48px_rgba(0,0,0,.55)] backdrop-blur-sm">
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
                className="group rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_16px_36px_-24px_rgba(0,0,0,0.72)] transition duration-300 ease-out hover:border-white/15 [&_summary::-webkit-details-marker]:hidden"
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
