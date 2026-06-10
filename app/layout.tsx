import "./globals.css";
import type { Metadata } from "next";
import { TopBar } from "./components/TopBar";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Porra del Mundial 2026",
  description:
    "Haz tu porra del Mundial 2026: ordena los grupos y la eliminatoria.",
};

// Aplica el tema guardado antes de pintar para evitar parpadeo (FOUC).
const themeScript = `(function(){try{var t=localStorage.getItem('porra2026:theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}else{document.documentElement.setAttribute('data-theme','light');}}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <html lang="es" data-theme="light">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <div className="app">
          <TopBar userName={user?.name} />
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
