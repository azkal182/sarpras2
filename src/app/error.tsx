"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="retro-shell grid min-h-screen place-items-center px-4 py-10">
    <Card className="w-full max-w-lg border-3 bg-coral p-6 shadow-lg">
      <p className="retro-kicker">Ada kendala</p>
      <h1 className="retro-title mt-3 text-5xl">Belum berhasil.</h1>
      <p className="mt-4 font-bold">Coba lagi. Jika masalah berulang, hubungi admin event.</p>
      <div className="mt-6 flex flex-wrap gap-3"><Button type="button" onClick={reset}>Coba lagi</Button><Link href="/" className={buttonVariants({ variant: "outline" })}>Ke beranda</Link></div>
    </Card>
  </main>;
}
