"use client";

import { CommandMenu } from "./command-menu";

interface AppShellProps {
  children: React.ReactNode;
  projects: { id: number; name: string }[];
  features?: { id: number; identifier: string; name: string; projectId: number }[];
}

export function AppShell({ children, projects, features = [] }: AppShellProps) {
  return (
    <>
      {children}
      <CommandMenu projects={projects} features={features} />
    </>
  );
}

