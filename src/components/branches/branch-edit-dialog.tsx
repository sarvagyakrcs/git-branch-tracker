"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Loader2 } from "lucide-react";
import { updateBranch } from "@/actions/branches";
import { toast } from "sonner";
import type { Branch } from "@/db/schema";

interface FormData {
  name: string;
  shortName: string;
  status: string;
  prUrl: string;
  prNumber: string;
  notes: string;
}

interface BranchEditDialogProps {
  branch: Branch;
  projectId: number;
  featureId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BranchEditDialog({
  branch,
  projectId,
  featureId,
  open,
  onOpenChange,
}: BranchEditDialogProps) {
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
      name: branch.name,
      shortName: branch.shortName || "",
      status: branch.status,
      prUrl: branch.prUrl || "",
      prNumber: branch.prNumber?.toString() || "",
      notes: branch.notes || "",
    },
  });

  const status = watch("status");

  useEffect(() => {
    if (open) {
      reset({
        name: branch.name,
        shortName: branch.shortName || "",
        status: branch.status,
        prUrl: branch.prUrl || "",
        prNumber: branch.prNumber?.toString() || "",
        notes: branch.notes || "",
      });
    }
  }, [open, branch, reset]);

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const result = await updateBranch(branch.id, {
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

      toast.success("Branch updated");
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Branch</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Branch Name *</Label>
            <Input
              id="edit-name"
              {...register("name", { required: "Required" })}
              className="font-mono text-sm"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-shortName">Short Name</Label>
            <Input id="edit-shortName" {...register("shortName")} />
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
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-prNumber">PR Number</Label>
              <Input id="edit-prNumber" {...register("prNumber")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-prUrl">PR URL</Label>
            <Input id="edit-prUrl" {...register("prUrl")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              rows={2}
              {...register("notes")}
              className="resize-none"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

