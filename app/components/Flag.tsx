import { getTeam } from "@/data/teams";

// Disco con la bandera (emoji) del equipo. Componente puro.
export function Flag({
  id,
  size = "",
}: {
  id: string;
  size?: "" | "sm" | "lg";
}) {
  const t = getTeam(id);
  return (
    <span className={`flag ${size}`} title={t?.name}>
      <span className="flag-emoji">{t?.flag || "🏳️"}</span>
    </span>
  );
}
