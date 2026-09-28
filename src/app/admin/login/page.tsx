import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BackLink } from "@/components/back-link";
import { LoginForm } from "@/components/login-form";
import { Card } from "@/components/ui/card";

export default async function AdminLoginPage() {
  if ((await auth())?.user) redirect("/admin");
  return <main className="retro-shell min-h-screen px-4 py-6 sm:grid sm:place-items-center sm:px-8">
    <div className="w-full max-w-md">
      <BackLink href="/">Kembali ke aplikasi</BackLink>
      <Card className="mt-6 border-3 bg-primary p-6 shadow-lg sm:p-8">
        <p className="retro-kicker">Sarpras admin</p>
        <h1 className="retro-title mt-4 text-5xl">Masuk<br />ke markas.</h1>
        <p className="mt-5 font-bold">Kelola event, divisi, dan kebutuhan panitia.</p>
        <Card className="mt-7 border-3 p-5 shadow-md"><LoginForm /></Card>
      </Card>
    </div>
  </main>;
}
