// ============================================================================
// Equipos del Mundial 2026 (48 equipos, 12 grupos A–L de 4 equipos).
//
// Datos del SORTEO OFICIAL (5 dic 2025, Washington D.C.), completado con los
// ganadores de las repescas de marzo 2026. Anfitriones en cabeza de grupo:
// México (A), Canadá (B), Estados Unidos (D).
//
// Formato: avanzan a dieciseisavos los 2 primeros de cada grupo (24) + los 8
// mejores terceros (de entre los 12) = 32 equipos.
//
// Nota: el orden dentro de cada grupo es solo el de presentación inicial; cada
// usuario lo reordena en su porra.
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

export const TEAMS: Team[] = [
  // Grupo A
  { id: "mex", name: "México", flag: "🇲🇽", group: "A" },
  { id: "rsa", name: "Sudáfrica", flag: "🇿🇦", group: "A" },
  { id: "kor", name: "Corea del Sur", flag: "🇰🇷", group: "A" },
  { id: "cze", name: "Chequia", flag: "🇨🇿", group: "A" },

  // Grupo B
  { id: "can", name: "Canadá", flag: "🇨🇦", group: "B" },
  { id: "sui", name: "Suiza", flag: "🇨🇭", group: "B" },
  { id: "qat", name: "Catar", flag: "🇶🇦", group: "B" },
  { id: "bih", name: "Bosnia y Herzegovina", flag: "🇧🇦", group: "B" },

  // Grupo C
  { id: "bra", name: "Brasil", flag: "🇧🇷", group: "C" },
  { id: "mar", name: "Marruecos", flag: "🇲🇦", group: "C" },
  { id: "hai", name: "Haití", flag: "🇭🇹", group: "C" },
  { id: "sco", name: "Escocia", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C" },

  // Grupo D
  { id: "usa", name: "Estados Unidos", flag: "🇺🇸", group: "D" },
  { id: "par", name: "Paraguay", flag: "🇵🇾", group: "D" },
  { id: "aus", name: "Australia", flag: "🇦🇺", group: "D" },
  { id: "tur", name: "Turquía", flag: "🇹🇷", group: "D" },

  // Grupo E
  { id: "ger", name: "Alemania", flag: "🇩🇪", group: "E" },
  { id: "cuw", name: "Curazao", flag: "🇨🇼", group: "E" },
  { id: "civ", name: "Costa de Marfil", flag: "🇨🇮", group: "E" },
  { id: "ecu", name: "Ecuador", flag: "🇪🇨", group: "E" },

  // Grupo F
  { id: "ned", name: "Países Bajos", flag: "🇳🇱", group: "F" },
  { id: "jpn", name: "Japón", flag: "🇯🇵", group: "F" },
  { id: "tun", name: "Túnez", flag: "🇹🇳", group: "F" },
  { id: "swe", name: "Suecia", flag: "🇸🇪", group: "F" },

  // Grupo G
  { id: "bel", name: "Bélgica", flag: "🇧🇪", group: "G" },
  { id: "egy", name: "Egipto", flag: "🇪🇬", group: "G" },
  { id: "irn", name: "Irán", flag: "🇮🇷", group: "G" },
  { id: "nzl", name: "Nueva Zelanda", flag: "🇳🇿", group: "G" },

  // Grupo H
  { id: "esp", name: "España", flag: "🇪🇸", group: "H" },
  { id: "cpv", name: "Cabo Verde", flag: "🇨🇻", group: "H" },
  { id: "ksa", name: "Arabia Saudí", flag: "🇸🇦", group: "H" },
  { id: "uru", name: "Uruguay", flag: "🇺🇾", group: "H" },

  // Grupo I
  { id: "fra", name: "Francia", flag: "🇫🇷", group: "I" },
  { id: "sen", name: "Senegal", flag: "🇸🇳", group: "I" },
  { id: "nor", name: "Noruega", flag: "🇳🇴", group: "I" },
  { id: "irq", name: "Irak", flag: "🇮🇶", group: "I" },

  // Grupo J
  { id: "arg", name: "Argentina", flag: "🇦🇷", group: "J" },
  { id: "alg", name: "Argelia", flag: "🇩🇿", group: "J" },
  { id: "aut", name: "Austria", flag: "🇦🇹", group: "J" },
  { id: "jor", name: "Jordania", flag: "🇯🇴", group: "J" },

  // Grupo K
  { id: "por", name: "Portugal", flag: "🇵🇹", group: "K" },
  { id: "uzb", name: "Uzbekistán", flag: "🇺🇿", group: "K" },
  { id: "col", name: "Colombia", flag: "🇨🇴", group: "K" },
  { id: "cod", name: "RD del Congo", flag: "🇨🇩", group: "K" },

  // Grupo L
  { id: "eng", name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L" },
  { id: "cro", name: "Croacia", flag: "🇭🇷", group: "L" },
  { id: "gha", name: "Ghana", flag: "🇬🇭", group: "L" },
  { id: "pan", name: "Panamá", flag: "🇵🇦", group: "L" },
];

export function teamsByGroup(group: string): Team[] {
  return TEAMS.filter((t) => t.group === group);
}

const TEAM_MAP = new Map(TEAMS.map((t) => [t.id, t]));

export function getTeam(id: string | null | undefined): Team | undefined {
  return id ? TEAM_MAP.get(id) : undefined;
}
