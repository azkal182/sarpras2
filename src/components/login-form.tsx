"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter(); const [error, setError] = useState(""); const [pending, setPending] = useState(false);
  async function submit(formData: FormData) {
    setPending(true); setError("");
    try {
      const result = await signIn("credentials", { email: formData.get("email"), password: formData.get("password"), redirect: false });
      if (result?.error) setError("Email atau password tidak valid.");
      else router.push("/admin");
    } catch { setError("Login belum berhasil. Coba lagi."); }
    finally { setPending(false); }
  }
  return <form action={submit} className="space-y-4"><Label>Email<Input name="email" type="email" required autoComplete="email" placeholder="admin@example.com" /></Label><Label>Password<Input name="password" type="password" required autoComplete="current-password" /></Label>{error && <p role="alert" className="border-2 border-black bg-coral p-3 text-sm font-bold">{error}</p>}<Button disabled={pending} size="lg" className="w-full">{pending ? "Memeriksa…" : "Masuk"}</Button></form>;
}
