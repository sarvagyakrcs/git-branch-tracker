"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, GitBranch, Link as LinkIcon } from "lucide-react";
import { createProject } from "@/actions/projects";
import { toast } from "sonner";

interface FormData {
  name: string;
  description: string;
  masterBranch: string;
  repoUrl: string;
}

export function ProjectCreateDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      masterBranch: "main",
      repoUrl: "",
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const result = await createProject({
        name: data.name,
        description: data.description || null,
        masterBranch: data.masterBranch || "main",
        repoUrl: data.repoUrl || null,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Project created successfully!");
      reset();
      setOpen(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to track your stacked diffs and branches.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Project Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Agent Platform"
              {...register("name", { required: "Project name is required" })}
              className="bg-background"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the project..."
              rows={3}
              {...register("description")}
              className="resize-none bg-background"
            />
          </div>

          {/* Master Branch */}
          <div className="space-y-2">
            <Label htmlFor="masterBranch" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              Master Branch
            </Label>
            <Input
              id="masterBranch"
              placeholder="main"
              {...register("masterBranch")}
              className="bg-background font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              The base branch for your stacked diffs (default: main)
            </p>
          </div>

          {/* Repository URL */}
          <div className="space-y-2">
            <Label htmlFor="repoUrl" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              Repository URL
            </Label>
            <Input
              id="repoUrl"
              placeholder="https://github.com/org/repo"
              {...register("repoUrl")}
              className="bg-background"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

