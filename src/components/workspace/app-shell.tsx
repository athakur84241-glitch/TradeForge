import type { ReactNode } from "react";
import { TopNavigation } from "./top-navigation";
import { WorkspaceNavigation } from "./workspace-navigation";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-tf-md bg-primary-solid px-4 py-3 text-sm font-semibold text-primary-solid-foreground transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <WorkspaceNavigation />
      <div className="min-w-0 lg:pl-20 xl:pl-[248px]">
        <TopNavigation />
        <main id="main-content" className="mx-auto w-full max-w-[1720px] px-4 pb-24 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}
