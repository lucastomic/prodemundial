import { redirect } from "next/navigation";
import { headers } from "next/headers";
import PorraEditor from "../PorraEditor";
import { savePredictionAction } from "../actions";
import { getPrediction } from "@/lib/db";
import { getCurrentUser, isLocked } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PorraPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const prediction = await getPrediction(user.id);
  const locked = isLocked();
  // La porra se puede editar siempre hasta que se cierren (deadline).
  const readOnly = locked;
  const lockReason: "deadline" | undefined = locked ? "deadline" : undefined;

  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const resumeUrl = `${proto}://${host}/resume?t=${user.id}`;

  return (
    <PorraEditor
      initial={prediction}
      readOnly={readOnly}
      lockReason={lockReason}
      onSave={savePredictionAction}
      mode="user"
      resumeUrl={resumeUrl}
      userName={user.name}
    />
  );
}
