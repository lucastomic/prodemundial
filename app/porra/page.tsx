import { redirect } from "next/navigation";
import { headers } from "next/headers";
import PorraEditor from "../PorraEditor";
import { savePredictionAction } from "../actions";
import { getPrediction } from "@/lib/db";
import { getCurrentUser, isLocked, lockAt } from "@/lib/session";

export const dynamic = "force-dynamic";

export default function PorraPage() {
  const user = getCurrentUser();
  if (!user) redirect("/");

  const prediction = getPrediction(user.id);
  const locked = isLocked();
  const lock = lockAt();

  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const resumeUrl = `${proto}://${host}/resume?t=${user.id}`;

  return (
    <div>
      <h1>La porra de {user.name}</h1>
      {locked ? (
        <div className="banner warn">
          Las porras están cerradas
          {lock ? ` (cierre: ${lock.toLocaleString("es-ES")})` : ""}. Tu porra
          está en modo solo lectura.
        </div>
      ) : (
        <p className="muted small">
          Guarda cuantas veces quieras hasta el cierre. Guarda tu enlace personal
          (abajo) para editar desde otro dispositivo.
        </p>
      )}
      <PorraEditor
        initial={prediction}
        readOnly={locked}
        onSave={savePredictionAction}
        mode="user"
        resumeUrl={resumeUrl}
      />
    </div>
  );
}
