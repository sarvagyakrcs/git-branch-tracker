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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { createBranch } from "@/actions/branches";
import { toast } from "sonner";

interface FormData {
  name: string;
  shortName: string;
  status: string;
  prUrl: string;
  notes: string;
}

interface BranchCreateDialogProps {
  featureId: number;
  projectId: number;
  featureIdentifier: string;
}

export function BranchCreateDialog({
  featureId,
  projectId,
  featureIdentifier,
}: BranchCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: {
      name: "",
      shortName: "",
      status: "active",
      prUrl: "",
      notes: "",
    },
  });

  const status = watch("status");

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const result = await createBranch({
        featureId,
        projectId,
        name: data.name,
        shortName: data.shortName || null,
        status: data.status,
        prUrl: data.prUrl || null,
        notes: data.notes || null,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Branch added");
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
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Branch
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Branch</DialogTitle>
          <DialogDescription>
            Add a new branch to the {featureIdentifier} stack.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Branch Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder={`e.g., username-${featureIdentifier}-feature-name-1`}
              {...register("name", { required: true })}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortName">Short Name</Label>
            <Input
              id="shortName"
              placeholder="e.g., feature-name"
              {...register("shortName")}
            />
            <p className="text-xs text-muted-foreground">
              A shorter name for display purposes
            </p>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setValue("status", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pr_raised">PR Raised</SelectItem>
                <SelectItem value="merged">Merged</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prUrl">PR URL</Label>
            <Input
              id="prUrl"
              placeholder="https://github.com/org/repo/pull/123"
              {...register("prUrl")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any notes..."
              rows={2}
              {...register("notes")}
              className="resize-none"
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
                  Adding...
                </>
              ) : (
                "Add Branch"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

