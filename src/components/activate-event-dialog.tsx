"use client";

import { activateEvent } from "@/app/actions";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function ActivateEventDialog({ eventId, eventName, size = "default" }: {
  eventId: string;
  eventName: string;
  size?: "default" | "sm";
}) {
  return <AlertDialog>
    <AlertDialogTrigger render={<Button type="button" size={size}>Aktifkan event</Button>} />
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Aktifkan {eventName}?</AlertDialogTitle>
        <AlertDialogDescription>Event yang saat ini aktif akan dinonaktifkan. Request lama tetap dapat dibaca sebagai arsip.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Batal</AlertDialogCancel>
        <form action={activateEvent.bind(null, eventId)}><AlertDialogAction className="w-full">Aktifkan event</AlertDialogAction></form>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}
