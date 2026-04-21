"use client";

import * as React from "react";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";

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
import { Button } from "@/components/ui/button";
import { useDeleteNotification } from "@/hooks/use-notifications";
import { ApiError } from "@/lib/api/client";

type Props = {
  notificationId: string;
  label: string;
};

export function DeleteNotificationDialog({ notificationId, label }: Props) {
  const [open, setOpen] = React.useState(false);
  const deleteMutation = useDeleteNotification();

  async function onConfirm(event: React.MouseEvent) {
    // Prevent Radix from auto-closing the dialog before our async work resolves.
    event.preventDefault();
    try {
      await deleteMutation.mutateAsync(notificationId);
      toast.success("Notification deleted");
      setOpen(false);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to delete notification";
      toast.error(message);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Delete ${label}`}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2Icon className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this notification?</AlertDialogTitle>
          <AlertDialogDescription>
            {label} will be permanently removed from the history. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/40"
          >
            {deleteMutation.isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
