// ============================================================================
// Cálculo de puntos de una porra comparándola con los resultados reales.
// ============================================================================

import { Bracket, Groups, reachedRounds } from "@/lib/bracket";
import { GROUPS } from "@/data/teams";

// ---- Constantes de puntuación (editar a gusto) ----
export const POINTS = {
  groupPosition: 3, // por cada equipo en su posición EXACTA dentro del grupo
  reachR16: 3, // acertar un equipo que llega a octavos
  reachQF: 5, // ... a cuartos
  reachSF: 8, // ... a semifinales
  reachFinal: 12, // ... a la final
  champion: 20, // acertar el campeón
};

export type Prediction = {
  groups: Groups;
  thirds: string[];
  bracket: Bracket;
};

export type Breakdown = {
  groups: number;
  knockout: number;
  total: number;
};

function intersectionSize(pred: Set<string>, real: Set<string>): number {
  let n = 0;
  for (const id of pred) if (real.has(id)) n++;
  return n;
}

export function scorePrediction(
  pred: Prediction,
  real: Prediction
): Breakdown {
  // --- Grupos: posición exacta ---
  let groups = 0;
  for (const letter of GROUPS) {
    const p = pred.groups[letter] ?? [];
    const r = real.groups[letter] ?? [];
    for (let i = 0; i < r.length; i++) {
      if (r[i] && p[i] && p[i] === r[i]) groups += POINTS.groupPosition;
    }
  }

  // --- Eliminatoria: equipos que alcanzan cada ronda ---
  const pr = reachedRounds(pred.bracket);
  const rr = reachedRounds(real.bracket);
  let knockout = 0;
  knockout += intersectionSize(pr.r16, rr.r16) * POINTS.reachR16;
  knockout += intersectionSize(pr.qf, rr.qf) * POINTS.reachQF;
  knockout += intersectionSize(pr.sf, rr.sf) * POINTS.reachSF;
  knockout += intersectionSize(pr.final, rr.final) * POINTS.reachFinal;
  if (pr.champion && pr.champion === rr.champion) knockout += POINTS.champion;

  return { groups, knockout, total: groups + knockout };
}
