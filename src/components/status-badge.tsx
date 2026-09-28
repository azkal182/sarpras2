import { Badge } from "@/components/ui/badge";

export function StatusBadge({ fulfilled }: { fulfilled: boolean }) {
  return <Badge variant={fulfilled ? "default" : "secondary"} className={fulfilled ? "bg-[#a8e6cf] text-black" : "bg-[#f7d64a] text-black"}>{fulfilled ? "Terpenuhi" : "Belum terpenuhi"}</Badge>;
}
