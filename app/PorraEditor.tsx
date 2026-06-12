"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Icons } from "./components/icons";
import { Flag } from "./components/Flag";
import { Banner } from "./components/Banner";

type SaveResult = { ok: boolean; error?: string };

export default function PorraEditor({
  initial,
  readOnly,
  lockReason,
  onSave,
  mode = "user",
  resumeUrl,
  userName,
}: {
  initial: Prediction;
  readOnly: boolean;
  lockReason?: "saved" | "deadline";
  onSave: (pred: Prediction) => Promise<SaveResult>;
  mode?: "user" | "admin";
  resumeUrl?: string;
  userName?: string | null;
}) {
  const router = useRouter();
  const [groups, setGroups] = useState<Groups>(initial.groups);
  const [thirds, setThirds] = useState<string[]>(initial.thirds);
  const [bracket, setBracket] = useState<Bracket>(initial.bracket);
  const [saved, setSaved] = useState(true);
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState("grupos");

  // La porra solo es de solo lectura si las porras están cerradas (deadline).
  const effectiveReadOnly = readOnly;
  const effectiveLockReason = lockReason;

  function dirty() {
    setSaved(false);
  }

  function reorderGroup(letter: string, newOrder: string[]) {
    if (effectiveReadOnly) return;
    const ng = { ...groups, [letter]: newOrder };
    setGroups(ng);
    setBracket(pruneBracket(ng, thirds, bracket));
    dirty();
  }

  function toggleThird(id: string) {
    if (effectiveReadOnly) return;
    let nt: string[];
    if (thirds.includes(id)) nt = thirds.filter((t) => t !== id);
    else {
      if (thirds.length >= 8) return;
      nt = [...thirds, id];
    }
    setThirds(nt);
    setBracket(pruneBracket(groups, nt, bracket));
    dirty();
  }

  function pickWinner(round: RoundKey, mi: number, teamId: string) {
    if (effectiveReadOnly || !teamId) return;
    const nb: Bracket = {
      r32: [...bracket.r32],
      r16: [...bracket.r16],
      qf: [...bracket.qf],
      sf: [...bracket.sf],
      final: [...bracket.final],
    };
    nb[round][mi] = nb[round][mi] === teamId ? "" : teamId;
    setBracket(pruneBracket(groups, thirds, nb));
    dirty();
  }

  function save() {
    startTransition(async () => {
      const res = await onSave({ groups, thirds, bracket });
      if (res.ok) {
        setSaved(true);
        if (mode === "admin") {
          setToast("Resultados guardados correctamente ✓");
        } else {
          setToast("Porra guardada ✓ Puedes seguir editándola.");
          router.refresh();
        }
      } else {
        setToast(res.error || "Error al guardar.");
      }
    });
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  // resalta el paso activo según la sección visible
  useEffect(() => {
    const ids: Record<string, string> = {
      "sec-grupos": "grupos",
      "sec-terceros": "terceros",
      "sec-cuadro": "cuadro",
    };
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveStep(ids[e.target.id]);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    Object.keys(ids).forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  function goStep(id: string) {
    const map: Record<string, string> = {
      grupos: "sec-grupos",
      terceros: "sec-terceros",
      cuadro: "sec-cuadro",
    };
    const el = document.getElementById(map[id]);
    if (el) window.scrollTo({ top: el.offsetTop - 76, behavior: "smooth" });
  }

  const thirdsDone = thirds.length === 8;
  const champ = bracket.final[0];
  const steps = [
    { id: "grupos", n: 1, label: "Grupos", done: true },
    { id: "terceros", n: 2, label: "Terceros", done: thirdsDone },
    { id: "cuadro", n: 3, label: "Cuadro", done: !!champ },
  ];

  return (
    <div className="wrap">
      <div className="editor-head">
        <span className="eyebrow">
          {mode === "admin" ? "Panel de administración" : "Mi porra"}
        </span>
        <h1 className="title" style={{ marginTop: 12 }}>
          {mode === "admin"
            ? "Resultados reales"
            : `La porra de ${userName || "tu equipo"}`}
        </h1>
        <p className="lead" style={{ marginTop: 8 }}>
          {mode === "admin"
            ? "Introduce el orden real de los grupos, los terceros clasificados y los ganadores reales. La clasificación se recalcula automáticamente."
            : "Completa los tres pasos hasta tu campeón. Puedes guardar y volver a editar tu porra todas las veces que quieras hasta que se cierren."}
        </p>

        {effectiveReadOnly && (
          <div style={{ marginTop: 18 }}>
            <Banner kind="warn">
              Las porras están <b>cerradas</b>. Esta es una vista de solo
              lectura.
            </Banner>
          </div>
        )}

        <div className="steps-nav">
          {steps.map((s) => (
            <button
              key={s.id}
              className={`step-tab ${activeStep === s.id ? "active" : ""} ${
                s.done ? "done" : ""
              }`}
              onClick={() => goStep(s.id)}
            >
              <span className="n">{s.done ? <Icons.check size={12} /> : s.n}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <GroupsSection
        groups={groups}
        onReorder={reorderGroup}
        readOnly={effectiveReadOnly}
      />
      <ThirdsSection
        groups={groups}
        thirds={thirds}
        onToggle={toggleThird}
        readOnly={effectiveReadOnly}
      />
      <BracketSection
        groups={groups}
        thirds={thirds}
        bracket={bracket}
        onPick={pickWinner}
        readOnly={effectiveReadOnly}
      />

      {!effectiveReadOnly && (
        <div className="save-bar">
          <div className="save-bar-inner">
            <div className={`save-meta ${saved ? "saved" : ""}`}>
              <span className="dot"></span>
              {saved ? "Todo guardado" : "Cambios sin guardar"}
            </div>
            {mode === "user" && resumeUrl && (
              <div className="token-link hide-sm">
                Enlace para retomar: <a href={resumeUrl}>{resumeUrl}</a>
              </div>
            )}
            <div className="save-spacer"></div>
            <button
              className="btn btn-primary"
              onClick={save}
              disabled={pending}
            >
              {pending ? (
                "Guardando…"
              ) : (
                <>
                  <Icons.save size={16} />{" "}
                  {mode === "admin" ? "Guardar resultados" : "Guardar porra"}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast">
          <Icons.circleCheck size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- GROUPS ----------------------------- */
function GroupsSection({
  groups,
  onReorder,
  readOnly,
}: {
  groups: Groups;
  onReorder: (letter: string, newOrder: string[]) => void;
  readOnly: boolean;
}) {
  return (
    <div className="editor-section" id="sec-grupos">
      <div className="section-head">
        <span className="section-num">1</span>
        <div>
          <h2 className="section-title">Ordena los grupos</h2>
          <p className="section-sub">
            Arrastra los equipos para colocarlos de 1º a 4º. Los 2 primeros pasan
            directos; el 3º es candidato a mejor tercero.
          </p>
        </div>
      </div>
      <div className="group-grid">
        {GROUPS.map((letter) => (
          <GroupCard
            key={letter}
            letter={letter}
            teamIds={groups[letter]}
            onReorder={onReorder}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}

function GroupCard({
  letter,
  teamIds,
  onReorder,
  readOnly,
}: {
  letter: string;
  teamIds: string[];
  onReorder: (letter: string, newOrder: string[]) => void;
  readOnly: boolean;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 6 },
    })
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = teamIds.indexOf(String(active.id));
    const to = teamIds.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    onReorder(letter, arrayMove(teamIds, from, to));
  }

  return (
    <div className="card group-card">
      <div className="group-card-head">
        <span className="group-letter">{letter}</span>
        <span className="gname">Grupo {letter}</span>
      </div>
      <div className="group-body">
        {readOnly ? (
          teamIds.map((teamId, idx) => (
            <TeamRowStatic key={teamId} teamId={teamId} idx={idx} />
          ))
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={teamIds}
              strategy={verticalListSortingStrategy}
            >
              {teamIds.map((teamId, idx) => (
                <SortableTeamRow key={teamId} teamId={teamId} idx={idx} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

function rowClass(idx: number) {
  return idx < 2 ? "qualifies" : idx === 2 ? "third" : "";
}

function TeamRowInner({ teamId, idx }: { teamId: string; idx: number }) {
  const t = getTeam(teamId);
  return (
    <>
      <span className="pos">{idx + 1}</span>
      <Flag id={teamId} size="sm" />
      <span className="tname">{t?.name}</span>
      {idx < 2 && <span className="tag q">Pasa</span>}
      {idx === 2 && <span className="tag t">3º</span>}
    </>
  );
}

function TeamRowStatic({ teamId, idx }: { teamId: string; idx: number }) {
  return (
    <div className={`team-row ${rowClass(idx)}`}>
      <TeamRowInner teamId={teamId} idx={idx} />
    </div>
  );
}

function SortableTeamRow({ teamId, idx }: { teamId: string; idx: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: teamId });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 5 : undefined,
    position: "relative",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`team-row draggable ${rowClass(idx)} ${
        isDragging ? "dragging" : ""
      }`}
      {...attributes}
    >
      <TeamRowInner teamId={teamId} idx={idx} />
      <span
        ref={setActivatorNodeRef}
        className="grip"
        aria-label="Arrastrar"
        {...listeners}
      >
        <Icons.grip size={18} />
      </span>
    </div>
  );
}

/* ----------------------------- THIRDS ----------------------------- */
function ThirdsSection({
  groups,
  thirds,
  onToggle,
  readOnly,
}: {
  groups: Groups;
  thirds: string[];
  onToggle: (id: string) => void;
  readOnly: boolean;
}) {
  const candidates = GROUPS.map((g) => groups[g]?.[2]).filter(Boolean) as string[];
  const pct = (thirds.length / 8) * 100;
  return (
    <div className="editor-section" id="sec-terceros">
      <div
        className="section-head"
        style={{ justifyContent: "space-between", width: "100%" }}
      >
        <div style={{ display: "flex", gap: 16 }}>
          <span className="section-num">2</span>
          <div>
            <h2 className="section-title">Mejores terceros</h2>
            <p className="section-sub">
              Avanzan los 8 mejores terceros de grupo. Elige cuáles pasan a
              dieciseisavos.
            </p>
          </div>
        </div>
        <div className="thirds-counter">
          <div className="counter-bar">
            <div className="counter-fill" style={{ width: `${pct}%` }}></div>
          </div>
          <span className="counter-num">
            <em>{thirds.length}</em>/8
          </span>
        </div>
      </div>
      <div className="thirds-grid">
        {candidates.map((teamId) => {
          const t = getTeam(teamId);
          const selected = thirds.includes(teamId);
          const disabled = readOnly || (!selected && thirds.length >= 8);
          return (
            <button
              key={teamId}
              className={`third-chip ${selected ? "selected" : ""}`}
              disabled={disabled}
              onClick={() => onToggle(teamId)}
            >
              <span className="check">{selected && <Icons.check size={13} />}</span>
              <Flag id={teamId} size="sm" />
              <span className="tn">{t?.name}</span>
              <span className="tg">{t?.group}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------- BRACKET ----------------------------- */
function Slot({
  teamId,
  picked,
  onPick,
  disabled,
}: {
  teamId: string;
  picked: boolean;
  onPick: () => void;
  disabled: boolean;
}) {
  const t = getTeam(teamId);
  if (!t)
    return (
      <div className="slot empty">
        <span className="sname">Por definir</span>
      </div>
    );
  return (
    <button
      className={`slot ${picked ? "picked" : ""}`}
      disabled={disabled}
      onClick={onPick}
      style={disabled ? { cursor: "default" } : undefined}
    >
      <Flag id={teamId} size="sm" />
      <span className="sname">{t.name}</span>
      <span className="winmark">
        <Icons.check size={14} />
      </span>
    </button>
  );
}

function BracketSection({
  groups,
  thirds,
  bracket,
  onPick,
  readOnly,
}: {
  groups: Groups;
  thirds: string[];
  bracket: Bracket;
  onPick: (round: RoundKey, mi: number, teamId: string) => void;
  readOnly: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<string[]>([]);
  const [dim, setDim] = useState({ w: 0, h: 0 });
  const lastKey = useRef("");

  function recompute() {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const base = wrap.getBoundingClientRect();
    const ox = wrap.scrollLeft - base.left;
    const oy = wrap.scrollTop - base.top;
    const center = (el: Element, side: "left" | "right") => {
      const r = el.getBoundingClientRect();
      return {
        x: (side === "right" ? r.right : r.left) + ox,
        y: r.top + oy + r.height / 2,
      };
    };
    const getMatches = (key: string) =>
      Array.from(wrap.querySelectorAll(`.match[data-round="${key}"]`));
    const next: string[] = [];
    for (let ri = 0; ri < ROUNDS.length - 1; ri++) {
      const cur = ROUNDS[ri].key;
      const nxt = ROUNDS[ri + 1].key;
      const curEls = getMatches(cur);
      const nxtEls = getMatches(nxt);
      curEls.forEach((el, i) => {
        const parent = nxtEls[Math.floor(i / 2)];
        if (!el || !parent) return;
        const a = center(el, "right");
        const b = center(parent, "left");
        const midX = (a.x + b.x) / 2;
        next.push(`M ${a.x} ${a.y} H ${midX} V ${b.y} H ${b.x}`);
      });
    }
    const finalEl = getMatches("final")[0];
    const champEl = wrap.querySelector(".champ-card");
    if (finalEl && champEl) {
      const a = center(finalEl, "right");
      const b = center(champEl, "left");
      const midX = (a.x + b.x) / 2;
      next.push(`M ${a.x} ${a.y} H ${midX} V ${b.y} H ${b.x}`);
    }
    const w = wrap.scrollWidth;
    const h = wrap.scrollHeight;
    const key = w + "x" + h + "|" + next.join("~");
    if (key === lastKey.current) return;
    lastKey.current = key;
    setPaths(next);
    setDim({ w, h });
  }

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    recompute();
    [60, 200, 500].forEach((ms) => timers.push(setTimeout(recompute, ms)));
    if (document.fonts && document.fonts.ready)
      document.fonts.ready.then(recompute);
    const ro = new ResizeObserver(() => recompute());
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener("resize", recompute);
    const wrap = wrapRef.current;
    wrap && wrap.addEventListener("scroll", recompute, { passive: true });
    return () => {
      timers.forEach(clearTimeout);
      ro.disconnect();
      window.removeEventListener("resize", recompute);
      wrap && wrap.removeEventListener("scroll", recompute);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // redibuja cuando cambian las elecciones o la estructura
  useEffect(() => {
    recompute();
  });

  const champion = bracket.final[0];
  const champTeam = getTeam(champion);
  const incomplete = thirds.length < 8;

  return (
    <div className="editor-section" id="sec-cuadro">
      <div className="section-head">
        <span className="section-num">3</span>
        <div>
          <h2 className="section-title">Cuadro eliminatorio</h2>
          <p className="section-sub">
            Haz clic en el equipo que avanza en cada cruce. Las rondas se rellenan
            a partir de tus elecciones.
          </p>
        </div>
      </div>

      {incomplete && (
        <div style={{ marginBottom: 14 }}>
          <Banner kind="warn">
            Selecciona los <b>8 mejores terceros</b> para completar los
            dieciseisavos.
          </Banner>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div className="bracket-wrap" ref={wrapRef}>
          <svg
            className="bracket-conn"
            width={dim.w}
            height={dim.h}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: "none",
              zIndex: 0,
              overflow: "visible",
            }}
          >
            {paths.map((d, i) => (
              <path
                key={i}
                d={d}
                className="bk-conn"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </svg>

          <div className="bracket" style={{ position: "relative" }}>
            {ROUNDS.map((round, ri) => (
              <div
                className={`round-col ${ri > 0 ? "has-prev" : ""}`}
                key={round.key}
              >
                <div className="round-head">
                  <div className="rh-label">{round.label}</div>
                  <div className="rh-sub">{round.sub}</div>
                </div>
                <div className="round-body">
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
                      <div
                        className="match"
                        key={i}
                        data-round={round.key}
                        data-mi={i}
                        style={{ position: "relative", zIndex: 1 }}
                      >
                        <Slot
                          teamId={a}
                          picked={pick === a && !!a}
                          disabled={readOnly || !a}
                          onPick={() => onPick(round.key, i, a)}
                        />
                        <Slot
                          teamId={b}
                          picked={pick === b && !!b}
                          disabled={readOnly || !b}
                          onPick={() => onPick(round.key, i, b)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Champion */}
            <div className="champ-col">
              <div
                className="champ-card"
                style={{ position: "relative", zIndex: 1 }}
              >
                <div className="champ-ey">Campeón del Mundo</div>
                <div className="champ-trophy">
                  <Icons.trophy size={46} />
                </div>
                {champTeam ? (
                  <>
                    <Flag id={champion} size="lg" />
                    <div className="champ-name" style={{ marginTop: 8 }}>
                      {champTeam.name}
                    </div>
                  </>
                ) : (
                  <div className="champ-empty">
                    Completa el cuadro para coronar a tu campeón
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
