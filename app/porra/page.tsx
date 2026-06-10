import { redirect } from "next/navigation";
import { headers } from "next/headers";
import PorraEditor from "../PorraEditor";
import { savePredictionAction } from "../actions";
import { getPrediction, hasPrediction } from "@/lib/db";
import { getCurrentUser, isLocked } from "@/lib/session";

export const dynamic = "force-dynamic";

export default function PorraPage() {
  const user = getCurrentUser();
  if (!user) redirect("/");

  const prediction = getPrediction(user.id);
  const alreadySaved = hasPrediction(user.id);
  const locked = isLocked();
  // La porra es definitiva: tras guardarla queda en solo lectura.
  const readOnly = locked || alreadySaved;
  const lockReason: "saved" | "deadline" | undefined = alreadySaved
    ? "saved"
    : locked
    ? "deadline"
    : undefined;

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
