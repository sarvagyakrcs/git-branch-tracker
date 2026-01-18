"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Book,
  Code,
  GitBranch,
  Layers,
  FolderGit2,
  Terminal,
  Home,
  ChevronLeft,
  ExternalLink,
  Bot,
  Copy,
  Check,
  Menu,
  X,
  Rocket,
  Zap,
  Database,
  Settings,
} from "lucide-react";

// Use env var or fallback to localhost
const BASE_URL = process.env.NEXT_PUBLIC_PROJECT_URL || "http://localhost:3000";

// Navigation sections
const NAV_SECTIONS = [
  { id: "overview", label: "Overview", icon: Book },
  { id: "quick-start", label: "Quick Start", icon: Rocket },
  { id: "endpoints", label: "API Endpoints", icon: Terminal },
  { id: "data-models", label: "Data Models", icon: Database },
  { id: "examples", label: "Examples", icon: Code },
  { id: "ai-integration", label: "AI Agent Integration", icon: Bot },
  { id: "setup", label: "Setup", icon: Settings },
];

// Copyable code block component
function CodeBlock({ 
  code, 
  language = "bash",
  title,
}: { 
  code: string; 
  language?: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative group rounded-lg overflow-hidden border bg-zinc-950">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b">
          <span className="text-xs font-medium text-zinc-400">{title}</span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {language}
          </Badge>
        </div>
      )}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-sm font-mono text-zinc-300 leading-relaxed">
          <code>{code}</code>
        </pre>
        <Button
          size="sm"
          variant="ghost"
          onClick={copyToClipboard}
          className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 hover:bg-zinc-700"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4 text-zinc-400" />
          )}
        </Button>
      </div>
    </div>
  );
}

// Endpoint row component
function EndpointRow({
  method,
  path,
  description,
}: {
  method: string;
  path: string;
  description: string;
}) {
  const [copied, setCopied] = useState(false);
  const methodColors: Record<string, string> = {
    GET: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    PUT: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  async function copyEndpoint() {
    await navigator.clipboard.writeText(`${BASE_URL}${path}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div 
      className="group flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={copyEndpoint}
    >
      <span
        className={`w-16 text-center px-2 py-1 rounded border text-xs font-mono font-semibold ${methodColors[method]}`}
      >
        {method}
      </span>
      <code className="flex-1 font-mono text-sm text-muted-foreground group-hover:text-foreground transition-colors">
        {path}
      </code>
      <span className="text-sm text-muted-foreground hidden md:block flex-1">
        {description}
      </span>
      <div className="w-8 flex justify-center">
        {copied ? (
          <Check className="h-4 w-4 text-emerald-400" />
        ) : (
          <Copy className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </div>
  );
}

// Section heading component
function SectionHeading({ 
  id, 
  icon: Icon, 
  children 
}: { 
  id: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
}) {
  return (
    <h2 id={id} className="text-xl font-semibold mb-6 flex items-center gap-3 scroll-mt-20">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      {children}
    </h2>
  );
}

export default function DocsPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div className="min-h-screen">
      {/* Mobile nav toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 md:hidden h-12 w-12 rounded-full shadow-lg"
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
      >
        {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform duration-200
          md:translate-x-0 md:static md:block
          ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <div className="sticky top-0 p-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 mb-8">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <GitBranch className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold">Branch Tracker</span>
            </Link>

            {/* Nav items */}
            <nav className="space-y-1">
              {NAV_SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={() => {
                      setActiveSection(section.id);
                      setMobileNavOpen(false);
                    }}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                      ${isActive 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    {section.label}
                  </a>
                );
              })}
            </nav>

            <Separator className="my-6" />

            {/* External links */}
            <div className="space-y-2">
              <a
                href="/llms.txt"
                target="_blank"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Bot className="h-4 w-4" />
                llms.txt
                <ExternalLink className="h-3 w-3 ml-auto" />
              </a>
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Home className="h-4 w-4" />
                Back to App
              </Link>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {mobileNavOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-6 py-12">
            {/* Header */}
            <header className="mb-12">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
                <ChevronLeft className="h-4 w-4 rotate-180" />
                <span className="text-foreground">Documentation</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                API Documentation
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Complete reference for the Branch Tracker API. Build integrations, 
                automate your workflow, or connect your AI coding assistant.
              </p>
              
              {/* Quick links */}
              <div className="flex flex-wrap gap-3 mt-6">
                <a
                  href="/llms.txt"
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                  <Bot className="h-4 w-4" />
                  View llms.txt
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="#ai-integration"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  <Zap className="h-4 w-4" />
                  AI Integration Guide
                </a>
              </div>
            </header>

            {/* Overview */}
            <section className="mb-16">
              <SectionHeading id="overview" icon={Book}>Overview</SectionHeading>
              
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Branch Tracker provides a REST API for managing stacked diffs and branch 
                  hierarchies. The API follows a hierarchical structure with Projects containing 
                  Features, and Features containing Branches.
                </p>
              </div>

              <CodeBlock
                title="Data Hierarchy"
                language="text"
                code={`Projects
└── Features (e.g., ticket numbers like "11627")
    └── Branches (ordered stack of branches)`}
              />

              <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm">
                  <strong className="text-primary">Base URL:</strong>{" "}
                  <code className="bg-muted px-2 py-0.5 rounded font-mono text-sm">{BASE_URL}</code>
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Configure via <code className="bg-muted px-1 rounded">NEXT_PUBLIC_PROJECT_URL</code> environment variable
                </p>
              </div>
            </section>

            {/* Quick Start */}
            <section className="mb-16">
              <SectionHeading id="quick-start" icon={Rocket}>Quick Start</SectionHeading>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">Create a project</h3>
                    <CodeBlock
                      language="bash"
                      code={`curl -X POST ${BASE_URL}/api/projects \\
  -H "Content-Type: application/json" \\
  -d '{"name": "My App", "masterBranch": "main"}'`}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">Create a feature</h3>
                    <CodeBlock
                      language="bash"
                      code={`curl -X POST ${BASE_URL}/api/projects/1/features \\
  -H "Content-Type: application/json" \\
  -d '{"identifier": "11627", "name": "New Feature"}'`}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">Add branches to your stack</h3>
                    <CodeBlock
                      language="bash"
                      code={`curl -X POST ${BASE_URL}/api/projects/1/features/1/branches \\
  -H "Content-Type: application/json" \\
  -d '{"name": "feature-branch-1", "notes": "First branch in stack"}'`}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* API Endpoints */}
            <section className="mb-16">
              <SectionHeading id="endpoints" icon={Terminal}>API Endpoints</SectionHeading>
              <p className="text-muted-foreground mb-6">
                Click any endpoint to copy the full URL to your clipboard.
              </p>

              {/* Projects */}
              <Card className="mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FolderGit2 className="h-4 w-4 text-primary" />
                    Projects
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    <EndpointRow method="GET" path="/api/projects" description="List all projects" />
                    <EndpointRow method="POST" path="/api/projects" description="Create a project" />
                    <EndpointRow method="GET" path="/api/projects/{id}" description="Get project details" />
                    <EndpointRow method="PUT" path="/api/projects/{id}" description="Update a project" />
                    <EndpointRow method="DELETE" path="/api/projects/{id}" description="Delete a project" />
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card className="mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    <EndpointRow method="GET" path="/api/projects/{pid}/features" description="List features" />
                    <EndpointRow method="POST" path="/api/projects/{pid}/features" description="Create a feature" />
                    <EndpointRow method="GET" path="/api/projects/{pid}/features/{fid}" description="Get feature with branches" />
                    <EndpointRow method="PUT" path="/api/projects/{pid}/features/{fid}" description="Update a feature" />
                    <EndpointRow method="DELETE" path="/api/projects/{pid}/features/{fid}" description="Delete a feature" />
                  </div>
                </CardContent>
              </Card>

              {/* Branches */}
              <Card className="mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-primary" />
                    Branches
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    <EndpointRow method="GET" path="/api/projects/{pid}/features/{fid}/branches" description="List branches" />
                    <EndpointRow method="POST" path="/api/projects/{pid}/features/{fid}/branches" description="Create a branch" />
                    <EndpointRow method="GET" path="/api/projects/{pid}/features/{fid}/branches/{bid}" description="Get branch" />
                    <EndpointRow method="PUT" path="/api/projects/{pid}/features/{fid}/branches/{bid}" description="Update a branch" />
                    <EndpointRow method="DELETE" path="/api/projects/{pid}/features/{fid}/branches/{bid}" description="Delete a branch" />
                  </div>
                </CardContent>
              </Card>

              {/* Utilities */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Utilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    <EndpointRow method="GET" path="/api/projects/{pid}/features/{fid}/verify-stack" description="Get stack verification script" />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Data Models */}
            <section className="mb-16">
              <SectionHeading id="data-models" icon={Database}>Data Models</SectionHeading>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <FolderGit2 className="h-4 w-4" />
                    Project
                  </h3>
                  <CodeBlock
                    language="json"
                    code={`{
  "id": 1,
  "name": "My Project",
  "description": "Optional description",
  "masterBranch": "main",
  "repoUrl": "https://github.com/...",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}`}
                  />
                </div>

                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Feature
                  </h3>
                  <CodeBlock
                    language="json"
                    code={`{
  "id": 1,
  "projectId": 1,
  "identifier": "11627",
  "name": "Agent Eval Feature",
  "description": "Optional description",
  "color": "#6366f1",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}`}
                  />
                </div>

                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    Branch
                  </h3>
                  <CodeBlock
                    language="json"
                    code={`{
  "id": 1,
  "featureId": 1,
  "name": "sarvagya-11627-db-infrastructure",
  "shortName": "db-infrastructure",
  "position": 1,
  "status": "pr_raised",
  "prUrl": "https://github.com/.../pull/123",
  "prNumber": 123,
  "notes": "Sets up database tables",
  "isPartOfStack": true,
  "isPlanned": false,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}`}
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground">Status values:</span>
                    <Badge variant="outline" className="border-amber-500/30 text-amber-400">planned</Badge>
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">active</Badge>
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400">pr_raised</Badge>
                    <Badge variant="outline" className="border-purple-500/30 text-purple-400">merged</Badge>
                    <Badge variant="outline" className="border-zinc-500/30 text-zinc-400">deprecated</Badge>
                    <Badge variant="outline" className="border-red-500/30 text-red-400">blocked</Badge>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    <strong>Plan Mode:</strong> Set <code className="bg-muted px-1 rounded">isPlanned: true</code> to 
                    create branches that exist only in the tracker (not in git yet).
                  </p>
                </div>
              </div>
            </section>

            {/* Examples */}
            <section className="mb-16">
              <SectionHeading id="examples" icon={Code}>Examples</SectionHeading>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Update branch status after PR</h3>
                  <CodeBlock
                    language="bash"
                    code={`curl -X PUT ${BASE_URL}/api/projects/1/features/1/branches/1 \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "pr_raised",
    "prUrl": "https://github.com/org/repo/pull/123",
    "prNumber": 123
  }'`}
                  />
                </div>

                <div>
                  <h3 className="font-medium mb-3">Mark branch as merged</h3>
                  <CodeBlock
                    language="bash"
                    code={`curl -X PUT ${BASE_URL}/api/projects/1/features/1/branches/1 \\
  -H "Content-Type: application/json" \\
  -d '{"status": "merged"}'`}
                  />
                </div>

                <div>
                  <h3 className="font-medium mb-3">Get stack verification script</h3>
                  <CodeBlock
                    language="bash"
                    code={`curl ${BASE_URL}/api/projects/1/features/1/verify-stack | jq -r '.data.script' | bash`}
                  />
                </div>
              </div>
            </section>

            {/* AI Integration */}
            <section className="mb-16">
              <SectionHeading id="ai-integration" icon={Bot}>AI Agent Integration</SectionHeading>
              
              <p className="text-muted-foreground mb-6">
                Configure your AI coding assistant to work with Branch Tracker. 
                Copy the appropriate configuration for your tool.
              </p>

              <div className="space-y-6">
                {/* Claude Code */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">C</span>
                      Claude Code
                      <Badge variant="secondary" className="ml-auto text-[10px]">CLAUDE.md</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock
                      language="markdown"
                      code={`## Branch Tracking

This project uses Branch Tracker for stacked diffs.
API: ${BASE_URL}
Full API Reference: ${BASE_URL}/llms.txt

### When creating a new branch:
1. Create the git branch as usual
2. Register it: POST /api/projects/1/features/1/branches
   Body: {"name": "branch-name", "notes": "description"}

### When raising a PR:
Update branch: PUT /api/projects/1/features/1/branches/{id}
Body: {"status": "pr_raised", "prUrl": "...", "prNumber": 123}

### Check stack health:
GET /api/projects/1/features/1/verify-stack
Run the returned script to verify ancestry.`}
                    />
                  </CardContent>
                </Card>

                {/* Cursor */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">⌘</span>
                      Cursor
                      <Badge variant="secondary" className="ml-auto text-[10px]">.cursorrules</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock
                      language="text"
                      code={`# Branch Tracker Integration

When working with git branches in this project:

1. This project uses stacked diffs tracked at ${BASE_URL}
2. API reference available at /llms.txt
3. After creating branches, register them via POST /api/.../branches
4. Keep branch statuses updated (active → pr_raised → merged)
5. Use GET .../verify-stack to check ancestry before rebasing

Key endpoints:
- GET /api/projects - list all projects
- GET /api/projects/{id}/features/{id} - get branches in stack
- POST .../branches - register new branch
- PUT .../branches/{id} - update status
- GET .../verify-stack - verify ancestry`}
                    />
                  </CardContent>
                </Card>

                {/* Cline / Other */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">⚡</span>
                      Cline / Aider / Others
                      <Badge variant="secondary" className="ml-auto text-[10px]">context file</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock
                      language="markdown"
                      code={`## Stacked Diffs Workflow

We use Branch Tracker (${BASE_URL}) to manage branch stacks.
API docs: /llms.txt

Common tasks:
- List branches: GET /api/projects/{pid}/features/{fid}
- Register branch: POST .../branches {"name": "...", "notes": "..."}
- Update status: PUT .../branches/{id} {"status": "pr_raised"}
- Verify stack: GET .../verify-stack (returns bash script)

Statuses: active, pr_raised, merged, deprecated, blocked`}
                    />
                  </CardContent>
                </Card>

                {/* Git Hook */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Terminal className="h-4 w-4" />
                      Git Hook (auto-register)
                      <Badge variant="secondary" className="ml-auto text-[10px]">.git/hooks/post-checkout</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock
                      language="bash"
                      code={`#!/bin/bash
BRANCH=$(git branch --show-current)
TRACKER="${BASE_URL}"
PROJECT=1
FEATURE=1

# Register branch if not exists
curl -s -X POST "$TRACKER/api/projects/$PROJECT/features/$FEATURE/branches" \\
  -H "Content-Type: application/json" \\
  -d "{\\"name\\": \\"$BRANCH\\"}" 2>/dev/null || true`}
                    />
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Setup */}
            <section className="mb-16">
              <SectionHeading id="setup" icon={Settings}>Setup</SectionHeading>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-bold shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">Clone and install</h3>
                    <CodeBlock
                      language="bash"
                      code={`git clone <repo-url>
cd git-branch-tracker
bun install`}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-bold shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">Configure environment</h3>
                    <CodeBlock
                      language="bash"
                      code={`# Create .env file
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
NEXT_PUBLIC_PROJECT_URL="http://localhost:3000"  # Optional`}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-bold shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">Run migrations</h3>
                    <CodeBlock
                      language="bash"
                      code={`bun run db:push`}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-bold shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">Start the server</h3>
                    <CodeBlock
                      language="bash"
                      code={`bun run dev`}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm text-emerald-400">
                  <strong>Ready!</strong> API available at{" "}
                  <code className="bg-emerald-500/20 px-2 py-0.5 rounded font-mono">{BASE_URL}/api</code>
                </p>
              </div>
            </section>

            {/* Footer */}
            <footer className="pt-8 border-t">
              <p className="text-sm text-muted-foreground text-center">
                Branch Tracker • Built for developers managing stacked diffs
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
