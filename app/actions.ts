"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import {
  createUser,
  savePrediction as dbSavePrediction,
  saveResults as dbSaveResults,
  type Prediction,
} from "@/lib/db";
import { pruneBracket } from "@/lib/bracket";
import {
  getCurrentUser,
  isAdmin,
  isLocked,
  setAdminCookie,
  setUserCookie,
  clearAdminCookie,
} from "@/lib/session";

// Crear participante (sin contraseña): solo nombre y email opcional.
export async function createUserAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") || "").trim();
  if (!name) redirect("/?error=nombre");

  const id = randomUUID();
  await createUser(id, name);
  setUserCookie(id);
  redirect("/porra");
}

// Guardar la porra del usuario actual (con saneo del cuadro).
export async function savePredictionAction(pred: Prediction): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "No has iniciado sesión." };
  if (isLocked()) return { ok: false, error: "Las porras están cerradas." };

  const cleaned: Prediction = {
    groups: pred.groups,
    thirds: pred.thirds.slice(0, 8),
    bracket: pruneBracket(pred.groups, pred.thirds, pred.bracket),
  };
  await dbSavePrediction(user.id, cleaned);
  return { ok: true };
}

// ---------- Admin ----------

export async function adminLoginAction(formData: FormData): Promise<void> {
  const password = String(formData.get("password") || "");
  if (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
    setAdminCookie();
    redirect("/admin");
  }
  redirect("/admin?error=1");
}

export async function adminLogoutAction(): Promise<void> {
  clearAdminCookie();
  redirect("/admin");
}

export async function saveResultsAction(pred: Prediction): Promise<{ ok: boolean; error?: string }> {
  if (!isAdmin()) return { ok: false, error: "No autorizado." };
  const cleaned: Prediction = {
    groups: pred.groups,
    thirds: pred.thirds.slice(0, 8),
    bracket: pruneBracket(pred.groups, pred.thirds, pred.bracket),
  };
  await dbSaveResults(cleaned);
  return { ok: true };
}
