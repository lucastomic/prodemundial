// ============================================================================
// Lógica del cuadro eliminatorio del Mundial 2026 (funciones puras, sin estado).
// Reutilizable tanto en el servidor como en el cliente.
//
// Avanzan 32 equipos a dieciseisavos: los 2 primeros de cada grupo (24) + los
// 8 mejores terceros elegidos por el usuario.
//
// NOTA: la siembra de los 8 terceros en el cuadro es una asignación DETERMINISTA
// y SIMPLIFICADA (los terceros se ordenan por letra de grupo y se emparejan
// entre sí). No reproduce la matriz oficial de terceros de la FIFA; se ha
// optado por esta simplificación para mantener la app sencilla.
// ============================================================================

import { GROUPS, TEAMS, getTeam } from "@/data/teams";

export type Groups = Record<string, string[]>; // letra -> [1º,2º,3º,4º] (teamIds)
export type Bracket = {
  r32: string[]; // 16 ganadores
  r16: string[]; // 8 ganadores
  qf: string[]; // 4 ganadores
  sf: string[]; // 2 ganadores
  final: string[]; // 1 campeón
};

export type RoundKey = "r32" | "r16" | "qf" | "sf" | "final";

export const ROUNDS: { key: RoundKey; matches: number; label: string }[] = [
  { key: "r32", matches: 16, label: "Dieciseisavos" },
  { key: "r16", matches: 8, label: "Octavos" },
  { key: "qf", matches: 4, label: "Cuartos" },
  { key: "sf", matches: 2, label: "Semifinales" },
  { key: "final", matches: 1, label: "Final" },
];

// Plantilla fija de dieciseisavos. Códigos: "1X"=1º grupo X, "2X"=2º grupo X,
// "Tn"=tercero nº n (0..7) tras ordenar los terceros elegidos por letra de grupo.
const R32_TEMPLATE: [string, string][] = [
  ["1A", "2B"], ["1C", "2D"], ["1E", "2F"], ["1G", "2H"],
  ["1I", "2J"], ["1K", "2L"], ["1B", "2A"], ["1D", "2C"],
  ["1F", "2E"], ["1H", "2G"], ["1J", "2I"], ["1L", "2K"],
  ["T0", "T1"], ["T2", "T3"], ["T4", "T5"], ["T6", "T7"],
];

export function emptyGroups(): Groups {
  const g: Groups = {};
  for (const letter of GROUPS) {
    g[letter] = TEAMS.filter((t) => t.group === letter).map((t) => t.id);
  }
  return g;
}

export function emptyBracket(): Bracket {
  return {
    r32: Array(16).fill(""),
    r16: Array(8).fill(""),
    qf: Array(4).fill(""),
    sf: Array(2).fill(""),
    final: Array(1).fill(""),
  };
}

// Terceros elegidos ordenados de forma determinista por letra de grupo.
function sortThirds(thirds: string[]): string[] {
  return [...thirds].sort((a, b) => {
    const ga = getTeam(a)?.group ?? "";
    const gb = getTeam(b)?.group ?? "";
    return ga < gb ? -1 : ga > gb ? 1 : 0;
  });
}

function resolveCode(code: string, groups: Groups, sortedThirds: string[]): string {
  if (code.startsWith("T")) {
    return sortedThirds[Number(code.slice(1))] ?? "";
  }
  const pos = code[0] === "1" ? 0 : 1;
  const letter = code.slice(1);
  return groups[letter]?.[pos] ?? "";
}

// Devuelve los dos equipos (teamIds) que disputan un partido de una ronda.
// "" indica que aún no está determinado (faltan picks previos o datos).
export function matchParticipants(
  round: RoundKey,
  matchIndex: number,
  groups: Groups,
  thirds: string[],
  bracket: Bracket
): [string, string] {
  if (round === "r32") {
    const sorted = sortThirds(thirds);
    const [a, b] = R32_TEMPLATE[matchIndex];
    return [resolveCode(a, groups, sorted), resolveCode(b, groups, sorted)];
  }
  const prevKey = ROUNDS[ROUNDS.findIndex((r) => r.key === round) - 1].key;
  const prev = bracket[prevKey];
  return [prev[matchIndex * 2] ?? "", prev[matchIndex * 2 + 1] ?? ""];
}

// Limpia picks que dejaron de ser válidos (p.ej. cambió el orden de un grupo y
// el equipo ya no participa en ese partido). Propaga ronda a ronda.
export function pruneBracket(
  groups: Groups,
  thirds: string[],
  bracket: Bracket
): Bracket {
  const out: Bracket = {
    r32: [...bracket.r32],
    r16: [...bracket.r16],
    qf: [...bracket.qf],
    sf: [...bracket.sf],
    final: [...bracket.final],
  };
  for (const { key, matches } of ROUNDS) {
    for (let i = 0; i < matches; i++) {
      const [a, b] = matchParticipants(key, i, groups, thirds, out);
      const pick = out[key][i];
      if (pick && pick !== a && pick !== b) out[key][i] = "";
    }
  }
  return out;
}

// Conjuntos de equipos que ALCANZAN cada ronda según un cuadro (para puntuar).
export function reachedRounds(bracket: Bracket): {
  r16: Set<string>;
  qf: Set<string>;
  sf: Set<string>;
  final: Set<string>;
  champion: string;
} {
  const clean = (arr: string[]) => arr.filter(Boolean);
  return {
    r16: new Set(clean(bracket.r32)), // ganar dieciseisavos = llegar a octavos
    qf: new Set(clean(bracket.r16)),
    sf: new Set(clean(bracket.qf)),
    final: new Set(clean(bracket.sf)),
    champion: bracket.final[0] ?? "",
  };
}
