"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

function friendlyError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Too many requests. Please wait a few minutes before trying again.";
  }
  if (lower.includes("invalid email") || lower.includes("valid email")) {
    return "Please enter a valid email address.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "Network error. Please check your connection and try again.";
  }
  return message;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    // Derive the callback URL from the current window origin so this works
    // on localhost in development and on any deployment domain in production.
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/update-password`
        : "/auth/update-password";

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo }
    );

    if (resetError) {
      setError(friendlyError(resetError.message));
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <main className="min-h-screen bg-background px-6 py-12 text-foreground">
        <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center justify-center">
          <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl text-center">
            <Link
              href="/home"
              className="font-display text-2xl font-bold tracking-tight text-white"
            >
              TradeForge
            </Link>

            <div className="mt-8 flex justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
                ✉️
              </span>
            </div>

            <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">
              Check your inbox
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              If an account exists for{" "}
              <span className="font-semibold text-white">{email}</span>, we sent
              a password-reset link. Click the link in the email to choose a new
              password.
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              Didn&apos;t receive it? Check your spam folder. The link expires
              after 1 hour.
            </p>

            <Link
              href="/sign-in"
              className="mt-7 inline-block w-full rounded-xl bg-primary px-4 py-3 text-center font-semibold text-white transition hover:opacity-90"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center justify-center">
        <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center">
            <Link
              href="/home"
              className="font-display text-2xl font-bold tracking-tight text-white"
            >
              TradeForge
            </Link>

            <h1 className="mt-8 text-3xl font-bold tracking-tight text-white">
              Reset your password
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Enter your account email and we&apos;ll send you a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-white"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-primary/60"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Sending link…" : "Send Reset Link"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remembered your password?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-primary hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
