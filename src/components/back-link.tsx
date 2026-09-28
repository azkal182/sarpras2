import Link from "next/link";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className={buttonVariants({ variant: "outline" })}>← {children}</Link>;
}
