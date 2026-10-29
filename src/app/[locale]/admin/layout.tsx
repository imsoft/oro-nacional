import type { Metadata } from "next";
import AdminShell from "./admin-shell";

// El panel no se indexa; la verificación de sesión vive en AdminShell (cliente)
export const metadata: Metadata = {
  title: "Panel de administración | Oro Nacional",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
