"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  GitBranch,
  FolderKanban,
  Layers,
  Plus,
  Search,
  Home,
  GitCompare,
  Book,
  Bot,
} from "lucide-react";

interface Project {
  id: number;
  name: string;
}

interface Feature {
  id: number;
  identifier: string;
  name: string;
  projectId: number;
}

interface CommandMenuProps {
  projects: Project[];
  features?: Feature[];
}

export function CommandMenu({ projects, features = [] }: CommandMenuProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      {/* Trigger hint */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-lg border bg-card/80 backdrop-blur-sm px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Quick actions</span>
        <kbd className="pointer-events-none ml-1 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search projects, features, or type a command..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/compare"))}>
              <GitCompare className="mr-2 h-4 w-4" />
              Compare Branches
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/docs"))}>
              <Book className="mr-2 h-4 w-4" />
              API Documentation
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => window.open("/llms.txt", "_blank"))}>
              <Bot className="mr-2 h-4 w-4" />
              View llms.txt
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Projects">
            {projects.map((project) => (
              <CommandItem
                key={project.id}
                onSelect={() => runCommand(() => router.push(`/projects/${project.id}`))}
              >
                <FolderKanban className="mr-2 h-4 w-4" />
                {project.name}
              </CommandItem>
            ))}
            {projects.length === 0 && (
              <CommandItem disabled>
                <span className="text-muted-foreground">No projects yet</span>
              </CommandItem>
            )}
          </CommandGroup>

          {features.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Features">
                {features.slice(0, 10).map((feature) => (
                  <CommandItem
                    key={feature.id}
                    onSelect={() =>
                      runCommand(() =>
                        router.push(`/projects/${feature.projectId}/features/${feature.id}`)
                      )
                    }
                  >
                    <Layers className="mr-2 h-4 w-4" />
                    <span className="font-mono text-xs mr-2">{feature.identifier}</span>
                    {feature.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          <CommandSeparator />

          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => {
                setOpen(false);
                // Trigger new project dialog - we'll emit a custom event
                document.dispatchEvent(new CustomEvent("open-new-project"));
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

