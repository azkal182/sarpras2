import { Badge } from "@/components/ui/badge";

export function StatusBadge({ fulfilled }: { fulfilled: boolean }) {
  return <Badge variant={fulfilled ? "default" : "secondary"} className={fulfilled ? "bg-mint text-black" : "bg-yellow text-black"}>{fulfilled ? "Terpenuhi" : "Belum terpenuhi"}</Badge>;
}
