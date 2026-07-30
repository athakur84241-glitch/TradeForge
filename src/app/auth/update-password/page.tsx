"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function friendlyError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("weak") || lower.includes("short") || lower.includes("at least")) {
    return "Password is too weak. Please use at least 8 characters.";
  }
  if (lower.includes("same") || lower.includes("different")) {
    return "New password must be different from your previous password.";
  }
  if (lower.includes("session") || lower.includes("expired") || lower.includes("token")) {
    return "This reset link has expired or is invalid. Please request a new one.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "Network error. Please check your connection and try again.";
  }
  return message;
}

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(friendlyError(updateError.message));
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Redirect to the dashboard after a brief moment to show the success message.
    setTimeout(() => router.push("/"), 2000);
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
              {success ? "Password updated" : "Set a new password"}
            </h1>

            {success ? (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Your password has been updated successfully. Redirecting you to
                the dashboard…
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Choose a strong new password for your account.
              </p>
            )}
          </div>

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  New password
                </label>

                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-primary/60"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Confirm new password
                </label>

                <input
                  id="confirm"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  placeholder="Repeat your new password"
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
                {loading ? "Updating password…" : "Update Password"}
              </button>
            </form>
          )}

          {success && (
            <div className="mt-4 text-center">
              <Link
                href="/"
                className="inline-block rounded-xl bg-primary px-8 py-3 font-semibold text-white transition hover:opacity-90"
              >
                Go to Dashboard
              </Link>
            </div>
          )}

          {!success && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link
                href="/sign-in"
                className="font-medium text-primary hover:underline"
              >
                Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
