"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Loader2, Lightbulb } from "lucide-react";
import { updateBranch } from "@/actions/branches";
import { toast } from "sonner";
import { BranchLifecycle, LIFECYCLE_STAGES } from "./branch-lifecycle";
import type { Branch } from "@/db/schema";

const ALL_STAGES = [
  { key: "planned", label: "Planned" },
  ...LIFECYCLE_STAGES.map(s => ({ key: s.key, label: s.label })),
  { key: "blocked", label: "Blocked" },
  { key: "deprecated", label: "Deprecated" },
];

interface FormData {
  name: string;
  status: string;
  prUrl: string;
  prNumber: string;
  notes: string;
  isPartOfStack: boolean;
  isPlanned: boolean;
}

interface BranchEditSheetProps {
  branch: Branch;
  projectId: number;
  featureId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BranchEditSheet({
  branch,
  projectId,
  featureId,
  open,
  onOpenChange,
}: BranchEditSheetProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: {
      name: branch.name,
      status: branch.status,
      prUrl: branch.prUrl || "",
      prNumber: branch.prNumber?.toString() || "",
      notes: branch.notes || "",
      isPartOfStack: branch.isPartOfStack,
      isPlanned: branch.isPlanned,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: branch.name,
        status: branch.status,
        prUrl: branch.prUrl || "",
        prNumber: branch.prNumber?.toString() || "",
        notes: branch.notes || "",
        isPartOfStack: branch.isPartOfStack,
        isPlanned: branch.isPlanned,
      });
    }
  }, [open, branch, reset]);

  const status = watch("status");
  const isPlanned = watch("isPlanned");

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const result = await updateBranch(branch.id, {
        name: data.name,
        status: data.status,
        prUrl: data.prUrl || null,
        prNumber: data.prNumber ? parseInt(data.prNumber) : null,
        notes: data.notes || null,
        isPartOfStack: data.isPartOfStack,
        isPlanned: data.isPlanned,
        projectId,
        featureId,
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Edit Branch</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-5">
            {/* Plan Mode Toggle */}
            <div className={`flex items-center justify-between p-3 rounded-lg border ${isPlanned ? "bg-amber-500/10 border-amber-500/30" : "bg-muted/30"}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isPlanned ? "bg-amber-500/20" : "bg-muted"}`}>
                  <Lightbulb className={`h-4 w-4 ${isPlanned ? "text-amber-400" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {isPlanned ? "Planned Branch" : "Realized Branch"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isPlanned 
                      ? "Not created in git yet" 
                      : "Exists in git repository"}
                  </p>
                </div>
              </div>
              <Switch
                checked={isPlanned}
                onCheckedChange={(checked) => {
                  setValue("isPlanned", checked);
                  if (checked) {
                    setValue("status", "planned");
                  } else if (status === "planned") {
                    setValue("status", "active");
                  }
                }}
              />
            </div>

            {/* Stage progress */}
            {!isPlanned && (
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground mb-3">Progress</p>
                <BranchLifecycle status={status} />
              </div>
            )}

            {/* Stage selector */}
            {!isPlanned && (
              <div className="space-y-2">
                <Label>Stage</Label>
                <Select value={status} onValueChange={(v) => setValue("status", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_STAGES.filter(s => s.key !== "planned").map((stage) => (
                      <SelectItem key={stage.key} value={stage.key}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Branch Name</Label>
              <Input
                {...register("name")}
                className="font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>PR #</Label>
                <Input
                  type="number"
                  placeholder="123"
                  {...register("prNumber")}
                />
              </div>
              <div className="space-y-2">
                <Label>PR URL</Label>
                <Input
                  placeholder="https://..."
                  {...register("prUrl")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Optional notes..."
                rows={2}
                {...register("notes")}
                className="resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isPartOfStack"
                checked={watch("isPartOfStack")}
                onCheckedChange={(checked) => setValue("isPartOfStack", checked === true)}
              />
              <Label htmlFor="isPartOfStack" className="text-sm font-normal cursor-pointer">
                Part of the stack
              </Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
