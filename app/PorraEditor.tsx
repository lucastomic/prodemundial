"use client";

import { useMemo, useState, useTransition } from "react";
import { GROUPS, getTeam } from "@/data/teams";
import {
  Bracket,
  Groups,
  ROUNDS,
  RoundKey,
  matchParticipants,
  pruneBracket,
} from "@/lib/bracket";
import type { Prediction } from "@/lib/db";

type SaveResult = { ok: boolean; error?: string };

export default function PorraEditor({
  initial,
  readOnly,
  onSave,
  mode = "user",
  resumeUrl,
}: {
  initial: Prediction;
  readOnly: boolean;
  onSave: (pred: Prediction) => Promise<SaveResult>;
  mode?: "user" | "admin";
  resumeUrl?: string;
}) {
  const [groups, setGroups] = useState<Groups>(initial.groups);
  const [thirds, setThirds] = useState<string[]>(initial.thirds);
  const [bracket, setBracket] = useState<Bracket>(initial.bracket);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok?: boolean; msg: string } | null>(
    null
  );

  function moveTeam(letter: string, idx: number, dir: -1 | 1) {
    if (readOnly) return;
    const arr = [...groups[letter]];
    const j = idx + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    const next = { ...groups, [letter]: arr };
    setGroups(next);
    setBracket(pruneBracket(next, thirds, bracket));
  }

  function toggleThird(id: string) {
    if (readOnly) return;
    let next: string[];
    if (thirds.includes(id)) {
      next = thirds.filter((t) => t !== id);
    } else {
      if (thirds.length >= 8) return;
      next = [...thirds, id];
    }
    setThirds(next);
    setBracket(pruneBracket(groups, next, bracket));
  }

  function pickWinner(round: RoundKey, matchIndex: number, teamId: string) {
    if (readOnly || !teamId) return;
    const next: Bracket = {
      r32: [...bracket.r32],
      r16: [...bracket.r16],
      qf: [...bracket.qf],
      sf: [...bracket.sf],
      final: [...bracket.final],
    };
    next[round][matchIndex] = next[round][matchIndex] === teamId ? "" : teamId;
    setBracket(pruneBracket(groups, thirds, next));
  }

  const thirdCandidates = useMemo(
    () => GROUPS.map((g) => groups[g]?.[2]).filter(Boolean) as string[],
    [groups]
  );

  const champion = bracket.final[0];

  function save() {
    setStatus(null);
    startTransition(async () => {
      const res = await onSave({ groups, thirds, bracket });
      setStatus(
        res.ok
          ? { ok: true, msg: "Guardado correctamente ✓" }
          : { ok: false, msg: res.error || "Error al guardar." }
      );
    });
  }

  return (
    <div>
      {/* ---------- Grupos ---------- */}
      <h2>1. Ordena los grupos</h2>
      <p className="muted small">
        Coloca los equipos de 1º a 4º con las flechas. Los 2 primeros (resaltados)
        pasan directos; el 3º es candidato a mejor tercero.
      </p>
      <div className="group-grid">
        {GROUPS.map((letter) => (
          <div className="card" key={letter} style={{ margin: 0 }}>
            <h3>Grupo {letter}</h3>
            {groups[letter].map((teamId, idx) => {
              const t = getTeam(teamId);
              return (
                <div
                  className={`team-row${idx < 2 ? " qualifies" : ""}`}
                  key={teamId}
                >
                  <span className="pos">{idx + 1}º</span>
                  <span className="flag">{t?.flag}</span>
                  <span className="name">{t?.name}</span>
                  {!readOnly && (
                    <>
                      <button
                        className="arrow-btn"
                        onClick={() => moveTeam(letter, idx, -1)}
                        disabled={idx === 0}
                        aria-label="Subir"
                      >
                        ▲
                      </button>
                      <button
                        className="arrow-btn"
                        onClick={() => moveTeam(letter, idx, 1)}
                        disabled={idx === groups[letter].length - 1}
                        aria-label="Bajar"
                      >
                        ▼
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* ---------- Mejores terceros ---------- */}
      <h2>2. Mejores terceros ({thirds.length}/8)</h2>
      <p className="muted small">
        En el formato 2026 avanzan los 8 mejores terceros. Elige cuáles de los 12
        terceros de grupo pasan a dieciseisavos.
      </p>
      <div className="thirds-grid">
        {thirdCandidates.map((teamId) => {
          const t = getTeam(teamId);
          const selected = thirds.includes(teamId);
          return (
            <div
              key={teamId}
              className={`third-chip${selected ? " selected" : ""}`}
              onClick={() => toggleThird(teamId)}
            >
              <span>{selected ? "✅" : "⬜"}</span>
              <span className="flag">{t?.flag}</span>
              <span>
                {t?.name} <span className="muted small">({t?.group})</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* ---------- Cuadro ---------- */}
      <h2>3. Cuadro eliminatorio</h2>
      <p className="muted small">
        Haz clic en el equipo que avanza en cada cruce. Las rondas se rellenan a
        partir de tus elecciones.
      </p>
      {thirds.length < 8 && (
        <div className="banner warn small">
          Selecciona los 8 mejores terceros para completar los dieciseisavos.
        </div>
      )}
      <div className="bracket">
        {ROUNDS.map((round) => (
          <div className="round-col" key={round.key}>
            <h3>{round.label}</h3>
            {Array.from({ length: round.matches }).map((_, i) => {
              const [a, b] = matchParticipants(
                round.key,
                i,
                groups,
                thirds,
                bracket
              );
              const pick = bracket[round.key][i];
              return (
                <div className="match" key={i}>
                  <Slot teamId={a} picked={pick === a && !!a} onPick={() => pickWinner(round.key, i, a)} />
                  <Slot teamId={b} picked={pick === b && !!b} onPick={() => pickWinner(round.key, i, b)} />
                </div>
              );
            })}
          </div>
        ))}
        <div className="round-col">
          <h3>Campeón 🏆</h3>
          <div className="match">
            <div className="champion-box">
              {champion ? (
                <>
                  <span className="flag">{getTeam(champion)?.flag}</span>{" "}
                  {getTeam(champion)?.name}
                </>
              ) : (
                <span className="muted">—</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Barra de guardado ---------- */}
      {!readOnly && (
        <div className="save-bar">
          <button className="btn-primary" onClick={save} disabled={pending}>
            {pending
              ? "Guardando…"
              : mode === "admin"
              ? "Guardar resultados reales"
              : "Guardar mi porra"}
          </button>
          {status && (
            <span className={status.ok ? "banner ok" : "banner error"} style={{ margin: 0 }}>
              {status.msg}
            </span>
          )}
          {mode === "user" && resumeUrl && (
            <div className="small muted">
              Tu enlace para retomar la porra:{" "}
              <a className="token-link" href={resumeUrl}>
                {resumeUrl}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Slot({
  teamId,
  picked,
  onPick,
}: {
  teamId: string;
  picked: boolean;
  onPick: () => void;
}) {
  const t = getTeam(teamId);
  if (!t) {
    return <div className="slot empty">Por definir</div>;
  }
  return (
    <div className={`slot${picked ? " picked" : ""}`} onClick={onPick}>
      <span className="flag">{t.flag}</span>
      <span>{t.name}</span>
    </div>
  );
}
