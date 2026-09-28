import { format, parseISO, subDays } from "date-fns";
import { id } from "date-fns/locale";
export function formatEventDate(value: string) { return format(parseISO(value), "d MMMM yyyy", { locale: id }); }
export function deadlineLabel(eventDate: string, offset: number | null) { if (offset === null) return "Tidak ada deadline"; const actual = format(subDays(parseISO(eventDate), offset), "d MMM yyyy", { locale: id }); return `${offset === 0 ? "Hari H" : `H-${offset}`} · ${actual}`; }
