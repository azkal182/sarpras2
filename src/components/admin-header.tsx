"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAdmin } from "@/app/actions";
import { Button, buttonVariants } from "@/components/ui/button";

export function AdminHeader() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;
  return <header className="retro-nav"><div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
    <Link href="/admin" className="flex items-center gap-3"><span className="grid size-9 place-items-center border-3 border-black bg-yellow-300 font-black">S</span><span className="font-black">SARPRAS / ADMIN</span></Link>
    <nav className="flex flex-wrap items-center gap-2 text-xs font-black uppercase"><Link href="/admin/events" className={buttonVariants({ variant: "outline", size: "sm" })}>Event</Link><Link href="/admin/requests" className={buttonVariants({ variant: "outline", size: "sm" })}>Request</Link><Link href="/" className={buttonVariants({ variant: "secondary", size: "sm" })}>Aplikasi</Link><form action={logoutAdmin}><Button size="sm" variant="outline">Keluar</Button></form></nav>
  </div></header>;
}
