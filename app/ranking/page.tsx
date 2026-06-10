import { getAllPredictions, getResults, hasResults } from "@/lib/db";
import { scorePrediction } from "@/lib/scoring";
import { getTeam } from "@/data/teams";
import { getCurrentUser } from "@/lib/session";
import { Flag } from "../components/Flag";
import { Banner } from "../components/Banner";

export const dynamic = "force-dynamic";

const MEDALS = ["g", "s", "b"];
const MEDAL_EMOJI = ["🥇", "🥈", "🥉"];

export default async function RankingPage() {
  const results = await getResults();
  const resultsReady = await hasResults();
  const me = await getCurrentUser();
  const entries = await getAllPredictions();

  const rows = entries
    .map(({ user, prediction }) => ({
      id: user.id,
      name: user.name,
      you: me?.id === user.id,
      champion: prediction.bracket.final[0],
      ...scorePrediction(prediction, results),
    }))
    .sort((a, b) => b.total - a.total);

  const top3 = rows.slice(0, 3);

  return (
    <div className="wrap">
      <div style={{ marginBottom: "var(--space-8)" }}>
        <span className="eyebrow">Clasificación general</span>
        <h1 className="title" style={{ marginTop: 12 }}>
          El ranking de la porra
        </h1>
        <p className="lead" style={{ marginTop: 8 }}>
          Puntuación en vivo de todos los participantes. Se actualiza con cada
          resultado que carga el administrador.
        </p>
      </div>

      {!resultsReady && (
        <div style={{ marginBottom: 20 }}>
          <Banner kind="warn">
            Aún no se han cargado resultados reales. La tabla mostrará{" "}
            <b>0 puntos</b> hasta que el administrador empiece a introducirlos.
          </Banner>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-glyph">🧾</div>
          <p>
            Todavía no hay porras guardadas.
            <br />
            Sé el primero en crear la tuya.
          </p>
        </div>
      ) : (
        <>
          {/* Podium */}
          {resultsReady && top3.length === 3 && (
            <div className="podium">
              {[1, 0, 2].map((order) => {
                const r = top3[order];
                if (!r) return <div key={order}></div>;
                const champ = getTeam(r.champion);
                return (
                  <div
                    className={`card podium-card ${order === 0 ? "p1" : ""}`}
                    key={order}
                    style={{
                      transform: order === 0 ? "translateY(-10px)" : "none",
                    }}
                  >
                    <div className={`medal ${MEDALS[order]}`}>
                      {MEDAL_EMOJI[order]}
                    </div>
                    <div className="podium-name">{r.name}</div>
                    <div className="podium-champ">
                      {champ ? (
                        <>
                          <Flag id={r.champion} size="sm" /> {champ.name}
                        </>
                      ) : (
                        "Sin campeón"
                      )}
                    </div>
                    <div className="podium-pts">
                      <b className="tnum">{r.total}</b>
                      <span>pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table */}
          <div
            className="card"
            style={{ padding: "var(--space-6) 0", overflowX: "auto" }}
          >
            <table className="rank-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 24 }}>#</th>
                  <th>Participante</th>
                  <th className="hide-sm">Su campeón</th>
                  <th className="num hide-sm">Grupos</th>
                  <th className="num hide-sm">Eliminatoria</th>
                  <th className="num" style={{ paddingRight: 24 }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const champ = getTeam(r.champion);
                  const medal = i < 3 && resultsReady;
                  return (
                    <tr key={r.id}>
                      <td style={{ paddingLeft: 24 }}>
                        {medal ? (
                          <span className={`rank-pos-badge ${MEDALS[i]}`}>
                            {i + 1}
                          </span>
                        ) : (
                          <span className="r-pos">{i + 1}</span>
                        )}
                      </td>
                      <td className="r-name">
                        {r.name}
                        {r.you && (
                          <span
                            className="pill"
                            style={{
                              marginLeft: 8,
                              background: "var(--accent-soft)",
                              color: "var(--accent-deep)",
                            }}
                          >
                            Tú
                          </span>
                        )}
                      </td>
                      <td className="hide-sm">
                        <span className="r-champ">
                          {champ ? (
                            <>
                              <Flag id={r.champion} size="sm" /> {champ.name}
                            </>
                          ) : (
                            "—"
                          )}
                        </span>
                      </td>
                      <td className="num r-sub hide-sm tnum">{r.groups}</td>
                      <td className="num r-sub hide-sm tnum">{r.knockout}</td>
                      <td
                        className="num r-total tnum"
                        style={{ paddingRight: 24 }}
                      >
                        {r.total}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="scoring-note">
        <span className="score-pill">
          <span className="sp-dot" style={{ background: "var(--success)" }}></span>{" "}
          Posición exacta de grupo <b>+3</b>
        </span>
        <span className="score-pill">
          <span className="sp-dot" style={{ background: "var(--sky)" }}></span>{" "}
          Llega a octavos <b>+3</b>
        </span>
        <span className="score-pill">
          <span className="sp-dot" style={{ background: "var(--sky)" }}></span>{" "}
          Cuartos <b>+5</b>
        </span>
        <span className="score-pill">
          <span className="sp-dot" style={{ background: "var(--sky)" }}></span>{" "}
          Semis <b>+8</b>
        </span>
        <span className="score-pill">
          <span className="sp-dot" style={{ background: "var(--sky)" }}></span>{" "}
          Final <b>+12</b>
        </span>
        <span className="score-pill">
          <span className="sp-dot" style={{ background: "var(--gold)" }}></span>{" "}
          Campeón <b>+20</b>
        </span>
      </div>
    </div>
  );
}
