import Link from "next/link";
import { ArrowDownToLine, ArrowUpFromLine, Radio } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

type Tab = "home" | "incoming" | "outgoing";
const tabs = [
  { key: "home", label: "Beranda", suffix: "", icon: Radio },
  { key: "outgoing", label: "Diajukan", suffix: "/diajukan", icon: ArrowUpFromLine },
  { key: "incoming", label: "Masuk", suffix: "/masuk", icon: ArrowDownToLine },
] as const;

export function DivisionNavigation({ eventSlug, divisionSlug, divisionNames, active }: {
  eventSlug: string;
  divisionSlug: string;
  divisionNames: { slug: string; name: string }[];
  active?: Tab;
}) {
  const base = `/event/${eventSlug}/divisi/${divisionSlug}`;
  return <>
    <nav aria-label="Pilih divisi" className="mt-6 flex gap-2 overflow-x-auto pb-3">
      {divisionNames.map((division) => <Link key={division.slug} href={`/event/${eventSlug}/divisi/${division.slug}`} aria-current={division.slug === divisionSlug ? "page" : undefined} className={buttonVariants({ variant: division.slug === divisionSlug ? "default" : "outline", className: "shrink-0" })}>{division.name}</Link>)}
    </nav>
    <nav aria-label="Halaman divisi" className="retro-bottom-nav">
      {tabs.map((tab) => <Link key={tab.key} href={base + tab.suffix} aria-current={active === tab.key ? "page" : undefined}><tab.icon size={18} />{tab.label}</Link>)}
    </nav>
  </>;
}
