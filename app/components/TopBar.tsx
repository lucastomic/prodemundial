"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "./icons";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/porra", label: "Mi porra" },
  { href: "/ranking", label: "Clasificación" },
  { href: "/admin", label: "Admin" },
];

export function TopBar({ userName }: { userName?: string | null }) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current =
      (document.documentElement.getAttribute("data-theme") as
        | "light"
        | "dark") || "light";
    setTheme(current);
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("porra2026:theme", next);
    } catch {}
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link className="brand" href="/" onClick={() => setNavOpen(false)}>
          <span className="brand-mark">
            <Icons.trophy size={19} style={{ color: "#fff" }} />
          </span>
          <span className="brand-name">
            <b>Porra Mundial</b>
            <span>2026 · CAN·MEX·USA</span>
          </span>
        </Link>
        <nav className={`nav ${navOpen ? "open" : ""}`}>
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={isActive(n.href) ? "active" : ""}
              onClick={() => setNavOpen(false)}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="topbar-right">
          {userName && (
            <span className="user-chip">
              <span className="avatar">
                {userName.slice(0, 1).toUpperCase()}
              </span>
              {userName}
            </span>
          )}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
          >
            {theme === "light" ? <Icons.moon size={18} /> : <Icons.sun size={18} />}
          </button>
          <button
            className="nav-toggle"
            onClick={() => setNavOpen((v) => !v)}
            aria-label="Menú"
          >
            {navOpen ? <Icons.x size={19} /> : <Icons.menu size={19} />}
          </button>
        </div>
      </div>
    </header>
  );
}
