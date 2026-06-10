import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Porra del Mundial 2026",
  description: "Haz tu porra del Mundial 2026: ordena los grupos y la eliminatoria.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <header className="nav">
          <div className="container">
            <Link href="/" className="brand">
              ⚽ Porra Mundial 2026
            </Link>
            <nav>
              <Link href="/porra">Mi porra</Link>
              <Link href="/ranking">Clasificación</Link>
              <Link href="/admin">Admin</Link>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
