import type { Metadata } from "next";

// Páginas privadas: no indexar
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
