"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function RequestDeleteButton({ action }: { action: () => Promise<void> }) {
  return <AlertDialog>
    <AlertDialogTrigger render={<Button type="button" variant="destructive" size="sm" />}><Trash2 size={14} />Hapus</AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Hapus request ini?</AlertDialogTitle>
        <AlertDialogDescription>Request yang dihapus tidak dapat dipulihkan.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Batal</AlertDialogCancel>
        <form action={action}><AlertDialogAction type="submit">Hapus request</AlertDialogAction></form>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}
