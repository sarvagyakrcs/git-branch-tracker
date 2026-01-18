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
  prNumber: string;
  notes: string;
}

export function BranchCreateDialog({
  projectId,
  featureId,
}: {
  projectId: number;
  featureId: number;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      shortName: "",
      status: "active",
      prUrl: "",
      prNumber: "",
      notes: "",
    },
  });

  const status = watch("status");

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const result = await createBranch({
        projectId,
        featureId,
        name: data.name,
        shortName: data.shortName || null,
        status: data.status,
        prUrl: data.prUrl || null,
        prNumber: data.prNumber ? parseInt(data.prNumber) : null,
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
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Branch
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Branch</DialogTitle>
          <DialogDescription>
            Add a new branch to this feature stack.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Branch Name *</Label>
            <Input
              id="name"
              placeholder="sarvagya-11627-db-infrastructure"
              {...register("name", { required: "Required" })}
              className="font-mono text-sm"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortName">Short Name</Label>
            <Input
              id="shortName"
              placeholder="db-infrastructure"
              {...register("shortName")}
            />
            <p className="text-xs text-muted-foreground">
              Optional friendly name for display
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="prNumber">PR Number</Label>
              <Input
                id="prNumber"
                placeholder="1234"
                {...register("prNumber")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prUrl">PR URL</Label>
            <Input
              id="prUrl"
              placeholder="https://github.com/org/repo/pull/1234"
              {...register("prUrl")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Optional notes..."
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

