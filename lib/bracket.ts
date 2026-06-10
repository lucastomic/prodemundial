// ============================================================================
// Lógica del cuadro eliminatorio del Mundial 2026 (funciones puras, sin estado).
// Reutilizable tanto en el servidor como en el cliente.
//
// Avanzan 32 equipos a dieciseisavos: los 2 primeros de cada grupo (24) + los
// 8 mejores terceros elegidos por el usuario.
//
// El cuadro reproduce los cruces OFICIALES de dieciseisavos del Mundial 2026,
// incluidos los conjuntos de grupos de la matriz de terceros (Anexo C). Como
// cada usuario elige libremente sus 8 terceros, éstos se asignan a los 8 huecos
// de tercero mediante un emparejamiento determinista que respeta esos conjuntos.
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

export const ROUNDS: { key: RoundKey; matches: number; label: string; sub: string }[] = [
  { key: "r32", matches: 16, label: "Dieciseisavos", sub: "32 equipos" },
  { key: "r16", matches: 8, label: "Octavos", sub: "16 equipos" },
  { key: "qf", matches: 4, label: "Cuartos", sub: "8 equipos" },
  { key: "sf", matches: 2, label: "Semifinales", sub: "4 equipos" },
  { key: "final", matches: 1, label: "Final", sub: "2 equipos" },
];

// Cuadro OFICIAL de dieciseisavos del Mundial 2026 (en orden de cuadro, de
// arriba a abajo). Códigos: "1X"=1º grupo X, "2X"=2º grupo X, "3"=tercero (se
// asigna según la matriz oficial de terceros, ver THIRD_SLOTS).
const R32_TEMPLATE: [string, string][] = [
  ["1E", "3"], ["1I", "3"],   // M1, M2
  ["2A", "2B"], ["1F", "2C"], // M3, M4
  ["2K", "2L"], ["1H", "2J"], // M5, M6
  ["1D", "3"], ["1G", "3"],   // M7, M8
  ["1C", "2F"], ["2E", "2I"], // M9, M10
  ["1A", "3"], ["1L", "3"],   // M11, M12
  ["1J", "2H"], ["2D", "2G"], // M13, M14
  ["1B", "3"], ["1K", "3"],   // M15, M16
];

// Matriz oficial de terceros: para cada dieciseisavo con un 3º, el conjunto de
// grupos de los que puede provenir ese tercero (Anexo C del reglamento). El
// índice es la posición del partido dentro de R32_TEMPLATE.
const THIRD_SLOTS: { index: number; allowed: string }[] = [
  { index: 0, allowed: "ABCDF" }, // 1E vs 3º
  { index: 1, allowed: "CDFGH" }, // 1I vs 3º
  { index: 6, allowed: "BEFIJ" }, // 1D vs 3º
  { index: 7, allowed: "AEHIJ" }, // 1G vs 3º
  { index: 10, allowed: "CEFHI" }, // 1A vs 3º
  { index: 11, allowed: "EHIJK" }, // 1L vs 3º
  { index: 14, allowed: "EFGIJ" }, // 1B vs 3º
  { index: 15, allowed: "DEIJL" }, // 1K vs 3º
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

// Asigna los terceros elegidos a los dieciseisavos respetando la matriz oficial
// (cada tercero sólo puede ir a un partido cuyo conjunto "allowed" incluya su
// grupo). Emparejamiento máximo determinista (algoritmo de Kuhn). Devuelve un
// mapa: índice de partido -> teamId del tercero asignado.
function assignThirds(thirds: string[]): Record<number, string> {
  // grupo -> teamId del tercero elegido de ese grupo
  const thirdByGroup = new Map<string, string>();
  for (const id of thirds) {
    const g = getTeam(id)?.group;
    if (g) thirdByGroup.set(g, id);
  }
  const groupsSel = [...thirdByGroup.keys()].sort();

  const slotGroup: (string | null)[] = THIRD_SLOTS.map(() => null);
  const tryAssign = (g: string, seen: Set<number>): boolean => {
    for (let s = 0; s < THIRD_SLOTS.length; s++) {
      if (!THIRD_SLOTS[s].allowed.includes(g) || seen.has(s)) continue;
      seen.add(s);
      const cur = slotGroup[s];
      if (cur === null || tryAssign(cur, seen)) {
        slotGroup[s] = g;
        return true;
      }
    }
    return false;
  };
  for (const g of groupsSel) tryAssign(g, new Set());

  const out: Record<number, string> = {};
  THIRD_SLOTS.forEach((slot, s) => {
    const g = slotGroup[s];
    if (g) out[slot.index] = thirdByGroup.get(g)!;
  });
  return out;
}

function resolveCode(
  code: string,
  groups: Groups,
  thirdAssign: Record<number, string>,
  matchIndex: number
): string {
  if (code === "3") return thirdAssign[matchIndex] ?? "";
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
    const assign = assignThirds(thirds);
    const [a, b] = R32_TEMPLATE[matchIndex];
    return [
      resolveCode(a, groups, assign, matchIndex),
      resolveCode(b, groups, assign, matchIndex),
    ];
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
