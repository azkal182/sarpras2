import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFoundPage() {
  return <main className="retro-shell grid min-h-screen place-items-center px-4 py-10">
    <Card className="w-full max-w-lg border-3 bg-primary p-6 shadow-lg">
      <p className="retro-kicker">404</p>
      <h1 className="retro-title mt-3 text-5xl">Halaman tidak ada.</h1>
      <p className="mt-4 font-bold">Periksa alamat atau kembali ke daftar event aktif.</p>
      <Link href="/" className={buttonVariants({ variant: "outline", className: "mt-6" })}>Ke beranda</Link>
    </Card>
  </main>;
}
