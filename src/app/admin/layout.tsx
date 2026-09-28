import { AdminHeader } from "@/components/admin-header";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="retro-shell min-h-screen"><AdminHeader />{children}</div>;
}
