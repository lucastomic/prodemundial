// ============================================================================
// SEED de equipos del Mundial 2026 (48 equipos, 12 grupos A–L de 4 equipos).
//
// ⚠️  IMPORTANTE: estos datos son una plantilla de partida. ANTES de abrir las
//     porras, el administrador DEBE verificar y editar los grupos/equipos para
//     que coincidan EXACTAMENTE con el sorteo oficial (incluidas las plazas de
//     repesca/playoff). Cambiar aquí los nombres, banderas y reparto de grupos.
//
// Estructura del torneo 2026:
//   - 48 equipos, 12 grupos (A–L) de 4 equipos.
//   - Avanzan a dieciseisavos: los 2 primeros de cada grupo (24) + los 8
//     mejores terceros (de entre los 12 terceros) = 32 equipos.
// ============================================================================

export type Team = {
  id: string; // identificador estable (no cambiar tras abrir porras)
  name: string;
  flag: string; // emoji de bandera
  group: string; // letra de grupo A–L
};

export const GROUPS = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
] as const;

export type GroupId = (typeof GROUPS)[number];

// 4 equipos por grupo. El orden aquí es solo el orden de presentación inicial.
export const TEAMS: Team[] = [
  // Grupo A
  { id: "mex", name: "México", flag: "🇲🇽", group: "A" },
  { id: "ned", name: "Países Bajos", flag: "🇳🇱", group: "A" },
  { id: "kor", name: "Corea del Sur", flag: "🇰🇷", group: "A" },
  { id: "gha", name: "Ghana", flag: "🇬🇭", group: "A" },

  // Grupo B
  { id: "can", name: "Canadá", flag: "🇨🇦", group: "B" },
  { id: "cro", name: "Croacia", flag: "🇭🇷", group: "B" },
  { id: "jpn", name: "Japón", flag: "🇯🇵", group: "B" },
  { id: "civ", name: "Costa de Marfil", flag: "🇨🇮", group: "B" },

  // Grupo C
  { id: "usa", name: "Estados Unidos", flag: "🇺🇸", group: "C" },
  { id: "bel", name: "Bélgica", flag: "🇧🇪", group: "C" },
  { id: "ecu", name: "Ecuador", flag: "🇪🇨", group: "C" },
  { id: "qat", name: "Catar", flag: "🇶🇦", group: "C" },

  // Grupo D
  { id: "arg", name: "Argentina", flag: "🇦🇷", group: "D" },
  { id: "sui", name: "Suiza", flag: "🇨🇭", group: "D" },
  { id: "aus", name: "Australia", flag: "🇦🇺", group: "D" },
  { id: "nga", name: "Nigeria", flag: "🇳🇬", group: "D" },

  // Grupo E
  { id: "fra", name: "Francia", flag: "🇫🇷", group: "E" },
  { id: "uru", name: "Uruguay", flag: "🇺🇾", group: "E" },
  { id: "irn", name: "Irán", flag: "🇮🇷", group: "E" },
  { id: "rsa", name: "Sudáfrica", flag: "🇿🇦", group: "E" },

  // Grupo F
  { id: "esp", name: "España", flag: "🇪🇸", group: "F" },
  { id: "col", name: "Colombia", flag: "🇨🇴", group: "F" },
  { id: "ksa", name: "Arabia Saudí", flag: "🇸🇦", group: "F" },
  { id: "nzl", name: "Nueva Zelanda", flag: "🇳🇿", group: "F" },

  // Grupo G
  { id: "bra", name: "Brasil", flag: "🇧🇷", group: "G" },
  { id: "ger", name: "Alemania", flag: "🇩🇪", group: "G" },
  { id: "egy", name: "Egipto", flag: "🇪🇬", group: "G" },
  { id: "pan", name: "Panamá", flag: "🇵🇦", group: "G" },

  // Grupo H
  { id: "eng", name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "H" },
  { id: "sen", name: "Senegal", flag: "🇸🇳", group: "H" },
  { id: "mar", name: "Marruecos", flag: "🇲🇦", group: "H" },
  { id: "jor", name: "Jordania", flag: "🇯🇴", group: "H" },

  // Grupo I
  { id: "por", name: "Portugal", flag: "🇵🇹", group: "I" },
  { id: "mex2", name: "Austria", flag: "🇦🇹", group: "I" },
  { id: "tun", name: "Túnez", flag: "🇹🇳", group: "I" },
  { id: "uzb", name: "Uzbekistán", flag: "🇺🇿", group: "I" },

  // Grupo J
  { id: "ita", name: "Italia", flag: "🇮🇹", group: "J" },
  { id: "den", name: "Dinamarca", flag: "🇩🇰", group: "J" },
  { id: "par", name: "Paraguay", flag: "🇵🇾", group: "J" },
  { id: "cpv", name: "Cabo Verde", flag: "🇨🇻", group: "J" },

  // Grupo K
  { id: "ned2", name: "Noruega", flag: "🇳🇴", group: "K" },
  { id: "mexk", name: "Escocia", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "K" },
  { id: "per", name: "Perú", flag: "🇵🇪", group: "K" },
  { id: "alg", name: "Argelia", flag: "🇩🇿", group: "K" },

  // Grupo L
  { id: "tur", name: "Turquía", flag: "🇹🇷", group: "L" },
  { id: "crc", name: "Costa Rica", flag: "🇨🇷", group: "L" },
  { id: "srb", name: "Serbia", flag: "🇷🇸", group: "L" },
  { id: "pol", name: "Polonia", flag: "🇵🇱", group: "L" },
];

export function teamsByGroup(group: string): Team[] {
  return TEAMS.filter((t) => t.group === group);
}

const TEAM_MAP = new Map(TEAMS.map((t) => [t.id, t]));

export function getTeam(id: string | null | undefined): Team | undefined {
  return id ? TEAM_MAP.get(id) : undefined;
}
