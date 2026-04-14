"use client";
import { useState } from "react";
import { useParams, usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { useCreateSavedView } from "@/api/insights/hooks/useSavedViews";

function getCurrentPage(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  return segments.length > 1 ? segments[1] : "main";
}

export function SaveViewDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { filters, time } = useStore();
  const pathname = usePathname();
  const params = useParams<{ site: string }>();
  const siteId = parseInt(params.site, 10);
  const { mutate: createView, isPending } = useCreateSavedView(siteId);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function handleSave() {
    if (!name.trim()) return;
    createView(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        page: getCurrentPage(pathname),
        filters,
        timeConfig: time,
      },
      {
        onSuccess: () => {
          setName("");
          setDescription("");
          onOpenChange(false);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save current view</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="sv-name">Name</Label>
            <Input
              id="sv-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. US traffic last 30 days"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sv-desc">
              Description{" "}
              <span className="text-neutral-500 font-normal">(optional)</span>
            </Label>
            <Textarea
              id="sv-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this view shows"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isPending}>
            {isPending ? "Saving..." : "Save view"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
