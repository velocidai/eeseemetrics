"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Bookmark, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetSavedViews,
  useUpdateSavedView,
  useDeleteSavedView,
} from "@/api/insights/hooks/useSavedViews";
import type { SavedView } from "@/api/insights/endpoints/savedViews";

function EditDialog({
  view,
  siteId,
  open,
  onOpenChange,
}: {
  view: SavedView;
  siteId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState(view.name);
  const [description, setDescription] = useState(view.description ?? "");
  const { mutate: updateView, isPending } = useUpdateSavedView(siteId);

  function handleSave() {
    if (!name.trim()) return;
    updateView(
      {
        viewId: view.id,
        payload: {
          name: name.trim(),
          description: description.trim() || null,
        },
      },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit view</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-desc">
              Description{" "}
              <span className="text-neutral-500 font-normal">(optional)</span>
            </Label>
            <Textarea
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function pageLabel(page: string): string {
  if (page === "main") return "Dashboard";
  return page.charAt(0).toUpperCase() + page.slice(1);
}

export default function SavedViewsPage() {
  const params = useParams();
  const siteId = parseInt(params.site as string, 10);
  const { data, isLoading } = useGetSavedViews(siteId);
  const { mutate: deleteView } = useDeleteSavedView(siteId);
  const [editingView, setEditingView] = useState<SavedView | null>(null);

  const views = data?.views ?? [];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Saved Views</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Saved filter and date range states you can reload from any analytics
          page.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-14 rounded-md bg-neutral-800 animate-pulse"
            />
          ))}
        </div>
      ) : views.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-neutral-700 rounded-lg">
          <Bookmark className="h-8 w-8 text-neutral-600 mb-3" />
          <p className="text-sm text-neutral-400">No saved views yet.</p>
          <p className="text-xs text-neutral-500 mt-1">
            Apply filters or change the date range on any analytics page, then
            click &quot;Save view&quot;.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {views.map((view) => (
            <div
              key={view.id}
              className="flex items-center justify-between p-3 rounded-md bg-neutral-900 border border-neutral-800"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{view.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {pageLabel(view.page)}
                  {view.description ? ` · ${view.description}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setEditingView(view)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete view?</AlertDialogTitle>
                      <AlertDialogDescription>
                        &quot;{view.name}&quot; will be permanently deleted.
                        This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => deleteView(view.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingView && (
        <EditDialog
          view={editingView}
          siteId={siteId}
          open={!!editingView}
          onOpenChange={(open) => !open && setEditingView(null)}
        />
      )}
    </div>
  );
}
