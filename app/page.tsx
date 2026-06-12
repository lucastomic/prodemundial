import Link from "next/link";
import { createUserAction } from "./actions";
import { getCurrentUser, isLocked } from "@/lib/session";
import { Icons } from "./components/icons";
import { Flag } from "./components/Flag";
import { Banner } from "./components/Banner";

export const dynamic = "force-dynamic";

const FEATURED = ["esp", "arg", "fra", "bra", "eng", "ger", "por", "ned"];

const HOW = [
  {
    icon: Icons.list,
    step: "Paso 1",
    title: "Ordena los grupos",
    desc: "Coloca los 4 equipos de cada grupo de 1º a 4º. Aciertas 3 puntos por cada posición exacta.",
  },
  {
    icon: Icons.star,
    step: "Paso 2",
    title: "Elige 8 mejores terceros",
    desc: "En el formato 2026 también clasifican los 8 mejores terceros de grupo.",
  },
  {
    icon: Icons.bracket,
    step: "Paso 3",
    title: "Completa el cuadro",
    desc: "Avanza ronda a ronda hasta tu campeón. Más puntos cuanto más lejos llegue.",
  },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const user = await getCurrentUser();
  const locked = isLocked();

  return (
    <div className="wrap">
      {/* ---- HERO ---- */}
      <section className="hero">
        <div className="hero-grid">
          <div>
            <span className="eyebrow">Porra · Copa del Mundo 2026 🇨🇦🇲🇽🇺🇸</span>
            <h1 className="title" style={{ marginTop: 14 }}>
              Predice el Mundial.
              <br />
              Demuestra que sabes
              <br />
              más que tus amigos.
            </h1>
            <p className="lead">
              Ordena los 12 grupos, elige los 8 mejores terceros y completa el
              cuadro hasta levantar el trofeo. Sin contraseñas, sin resultados
              exactos: solo tu instinto.
            </p>

            <div className="hero-stats">
              {[
                ["48", "Selecciones"],
                ["12", "Grupos"],
                ["104", "Partidos"],
                ["1", "Campeón"],
              ].map(([num, label]) => (
                <div className="stat" key={label}>
                  <div className="stat-num">
                    <em>{num}</em>
                  </div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* decorative pitch */}
          <div className="pitch">
            <span
              className="pill pitch-tag"
              style={{ background: "rgba(255,255,255,.10)", color: "#fff" }}
            >
              <span
                className="pill-dot"
                style={{ background: "var(--gold)" }}
              ></span>
              Final · 19 JUL 2026 · MetLife
            </span>
            <div className="pitch-trophy">
              <Icons.trophy size={120} style={{ color: "#eab308" }} />
            </div>
            <div className="flag-ticker">
              {FEATURED.map((id) => (
                <Flag key={id} id={id} size="sm" />
              ))}
              <span
                className="flag sm"
                style={{
                  color: "rgba(255,255,255,.7)",
                  fontWeight: 800,
                  fontSize: 11,
                }}
              >
                +40
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---- SIGNUP / WELCOME ---- */}
      <section style={{ marginTop: "var(--space-12)" }}>
        {user ? (
          <div className="card signup-card" style={{ maxWidth: 560 }}>
            <span className="eyebrow">Sesión iniciada</span>
            <h2 style={{ marginTop: 8 }}>¡Hola de nuevo, {user.name}! 👋</h2>
            <p className="sub">
              Ya estás dado de alta. Tu porra se guarda en este dispositivo.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn btn-primary btn-lg" href="/porra">
                Ir a mi porra <Icons.arrowRight size={17} />
              </Link>
              <Link className="btn btn-lg" href="/ranking">
                <Icons.trophy size={17} /> Ver clasificación
              </Link>
            </div>
          </div>
        ) : (
          <div
            className="signup-row"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
              gap: "var(--space-8)",
              alignItems: "start",
            }}
          >
            <div className="card signup-card">
              <h2>Crea tu porra</h2>
              <p className="sub">
                Solo necesitas tu nombre. Te daremos un enlace personal para
                retomarla desde cualquier dispositivo.
              </p>

              {locked && (
                <div style={{ marginBottom: 16 }}>
                  <Banner kind="warn">
                    Las porras están <b>cerradas</b>. Puedes registrarte y ver la
                    clasificación, pero no editar.
                  </Banner>
                </div>
              )}
              {searchParams.error === "nombre" && (
                <div style={{ marginBottom: 16 }}>
                  <Banner kind="err">Escribe tu nombre para continuar.</Banner>
                </div>
              )}
              {searchParams.error === "enlace" && (
                <div style={{ marginBottom: 16 }}>
                  <Banner kind="err">
                    Ese enlace para retomar la porra no es válido.
                  </Banner>
                </div>
              )}

              <form action={createUserAction}>
                <div className="field">
                  <label className="label" htmlFor="name">
                    Tu nombre
                  </label>
                  <input
                    id="name"
                    name="name"
                    className="input"
                    placeholder="Ej. Lucas"
                    autoComplete="off"
                    required
                  />
                </div>
                <button
                  className="btn btn-primary btn-lg"
                  type="submit"
                  style={{ width: "100%", marginTop: 6 }}
                >
                  Empezar mi porra <Icons.arrowRight size={17} />
                </button>
              </form>
              <p
                style={{
                  fontSize: 12.5,
                  color: "var(--subtle)",
                  marginTop: 16,
                  marginBottom: 0,
                }}
              >
                ¿Ya tienes una porra en otro dispositivo? Usa el enlace personal
                que se te mostró al guardar.
              </p>
            </div>

            {/* how it works */}
            <div>
              <span className="eyebrow">Cómo funciona</span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginTop: 14,
                }}
              >
                {HOW.map(({ icon: I, step, title, desc }) => (
                  <div
                    className="card"
                    key={step}
                    style={{
                      padding: 18,
                      display: "flex",
                      gap: 14,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      className="how-ico"
                      style={{ margin: 0, flexShrink: 0 }}
                    >
                      <I size={21} />
                    </div>
                    <div>
                      <div className="how-step">{step}</div>
                      <h3
                        style={{
                          margin: "3px 0 5px",
                          fontSize: 15.5,
                          fontWeight: 700,
                        }}
                      >
                        {title}
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          color: "var(--muted)",
                          lineHeight: 1.5,
                        }}
                      >
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
