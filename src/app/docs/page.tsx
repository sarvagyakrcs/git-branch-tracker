import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link
            href="/"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Home className="h-3 w-3" /> Home
          </Link>
          <ChevronLeft className="h-4 w-4 rotate-180" />
          <span className="text-foreground">Documentation</span>
        </div>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Book className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                API Documentation
              </h1>
              <p className="text-sm text-muted-foreground">
                For AI agents and developers
              </p>
            </div>
          </div>
        </header>

        {/* LLMs.txt callout */}
        <Card className="mb-8 border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-4">
            <Bot className="h-8 w-8 text-primary shrink-0" />
            <div className="flex-1">
              <p className="font-medium">AI Agent Reference</p>
              <p className="text-sm text-muted-foreground">
                For LLMs and AI coding assistants, we provide a machine-readable
                API reference at{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                  /llms.txt
                </code>
              </p>
            </div>
            <a
              href="/llms.txt"
              target="_blank"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View llms.txt <ExternalLink className="h-3 w-3" />
            </a>
          </CardContent>
        </Card>

        {/* Overview */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Code className="h-5 w-5 text-muted-foreground" />
            Overview
          </h2>
          <Card>
            <CardContent className="p-4 prose prose-sm prose-invert max-w-none">
              <p>
                Branch Tracker provides a REST API for managing stacked diffs
                and branch hierarchies. The API follows a hierarchical structure:
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`Projects
└── Features (e.g., ticket numbers like "11627")
    └── Branches (ordered stack of branches)`}
              </pre>
              <p>
                All responses follow the format:{" "}
                <code>{"{ data: T | null, error: string | null }"}</code>
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Endpoints */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Terminal className="h-5 w-5 text-muted-foreground" />
            API Endpoints
          </h2>

          <div className="space-y-4">
            {/* Projects */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderGit2 className="h-4 w-4" />
                  Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <EndpointRow
                  method="GET"
                  path="/api/projects"
                  description="List all projects"
                />
                <EndpointRow
                  method="POST"
                  path="/api/projects"
                  description="Create a new project"
                />
                <EndpointRow
                  method="GET"
                  path="/api/projects/{id}"
                  description="Get project details"
                />
                <EndpointRow
                  method="PUT"
                  path="/api/projects/{id}"
                  description="Update a project"
                />
                <EndpointRow
                  method="DELETE"
                  path="/api/projects/{id}"
                  description="Delete a project"
                />
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <EndpointRow
                  method="GET"
                  path="/api/projects/{projectId}/features"
                  description="List features in a project"
                />
                <EndpointRow
                  method="POST"
                  path="/api/projects/{projectId}/features"
                  description="Create a new feature"
                />
                <EndpointRow
                  method="GET"
                  path="/api/projects/{projectId}/features/{featureId}"
                  description="Get feature with branches"
                />
                <EndpointRow
                  method="PUT"
                  path="/api/projects/{projectId}/features/{featureId}"
                  description="Update a feature"
                />
                <EndpointRow
                  method="DELETE"
                  path="/api/projects/{projectId}/features/{featureId}"
                  description="Delete a feature"
                />
              </CardContent>
            </Card>

            {/* Branches */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  Branches
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <EndpointRow
                  method="GET"
                  path="/.../features/{featureId}/branches"
                  description="List branches in a feature"
                />
                <EndpointRow
                  method="POST"
                  path="/.../features/{featureId}/branches"
                  description="Create a new branch"
                />
                <EndpointRow
                  method="GET"
                  path="/.../branches/{branchId}"
                  description="Get branch details"
                />
                <EndpointRow
                  method="PUT"
                  path="/.../branches/{branchId}"
                  description="Update a branch"
                />
                <EndpointRow
                  method="DELETE"
                  path="/.../branches/{branchId}"
                  description="Delete a branch"
                />
                <EndpointRow
                  method="GET"
                  path="/.../features/{featureId}/verify-stack"
                  description="Get stack verification commands"
                />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Data Models */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Code className="h-5 w-5 text-muted-foreground" />
            Data Models
          </h2>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Project</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
{`{
  "id": 1,
  "name": "My Project",
  "description": "Optional description",
  "masterBranch": "main",
  "repoUrl": "https://github.com/...",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Feature</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
{`{
  "id": 1,
  "projectId": 1,
  "identifier": "11627",
  "name": "Agent Eval Feature",
  "description": "Optional description",
  "color": "#6366f1",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Branch</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
{`{
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
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}`}
                </pre>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground">Status values:</span>
                  <Badge variant="secondary">active</Badge>
                  <Badge variant="secondary">pr_raised</Badge>
                  <Badge variant="secondary">merged</Badge>
                  <Badge variant="secondary">deprecated</Badge>
                  <Badge variant="secondary">blocked</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Example Workflows */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Terminal className="h-5 w-5 text-muted-foreground" />
            Example Workflows
          </h2>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Creating a stacked diff workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
{`# 1. Create a project
curl -X POST http://localhost:3000/api/projects \\
  -H "Content-Type: application/json" \\
  -d '{"name": "My App", "masterBranch": "main"}'

# 2. Create a feature for your ticket
curl -X POST http://localhost:3000/api/projects/1/features \\
  -H "Content-Type: application/json" \\
  -d '{"identifier": "11627", "name": "Agent Eval"}'

# 3. Add branches to the stack
curl -X POST http://localhost:3000/api/projects/1/features/1/branches \\
  -H "Content-Type: application/json" \\
  -d '{"name": "sarvagya-11627-db-infrastructure"}'

curl -X POST http://localhost:3000/api/projects/1/features/1/branches \\
  -H "Content-Type: application/json" \\
  -d '{"name": "sarvagya-11627-backend-api"}'

# 4. Update branch status when PR is raised
curl -X PUT http://localhost:3000/api/projects/1/features/1/branches/1 \\
  -H "Content-Type: application/json" \\
  -d '{"status": "pr_raised", "prUrl": "https://...", "prNumber": 123}'

# 5. Get verification script
curl http://localhost:3000/api/projects/1/features/1/verify-stack`}
              </pre>
            </CardContent>
          </Card>
        </section>

        {/* Setup */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Code className="h-5 w-5 text-muted-foreground" />
            Setup
          </h2>

          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <h3 className="font-medium mb-2">1. Clone and install</h3>
                <pre className="bg-muted p-3 rounded-lg text-sm font-mono">
{`git clone <repo-url>
cd git-branch-tracker
bun install`}
                </pre>
              </div>

              <div>
                <h3 className="font-medium mb-2">2. Set up database</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Create a PostgreSQL database and add the connection URL to{" "}
                  <code className="bg-muted px-1.5 py-0.5 rounded">.env</code>:
                </p>
                <pre className="bg-muted p-3 rounded-lg text-sm font-mono">
{`DATABASE_URL="postgresql://user:pass@host:5432/dbname"`}
                </pre>
              </div>

              <div>
                <h3 className="font-medium mb-2">3. Run migrations</h3>
                <pre className="bg-muted p-3 rounded-lg text-sm font-mono">
{`bun run db:push`}
                </pre>
              </div>

              <div>
                <h3 className="font-medium mb-2">4. Start the server</h3>
                <pre className="bg-muted p-3 rounded-lg text-sm font-mono">
{`bun run dev`}
                </pre>
              </div>

              <div>
                <h3 className="font-medium mb-2">5. Access the API</h3>
                <p className="text-sm text-muted-foreground">
                  API is available at{" "}
                  <code className="bg-muted px-1.5 py-0.5 rounded">
                    http://localhost:3000/api
                  </code>
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function EndpointRow({
  method,
  path,
  description,
}: {
  method: string;
  path: string;
  description: string;
}) {
  const methodColors: Record<string, string> = {
    GET: "bg-emerald-500/20 text-emerald-400",
    POST: "bg-blue-500/20 text-blue-400",
    PUT: "bg-amber-500/20 text-amber-400",
    DELETE: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      <span
        className={`w-16 text-center px-2 py-0.5 rounded text-xs font-mono font-medium ${methodColors[method]}`}
      >
        {method}
      </span>
      <code className="flex-1 font-mono text-xs text-muted-foreground">
        {path}
      </code>
      <span className="text-muted-foreground text-xs hidden sm:block">
        {description}
      </span>
    </div>
  );
}

