import { getAllPredictions, getResults, hasResults } from "@/lib/db";
import { scorePrediction } from "@/lib/scoring";
import { getTeam } from "@/data/teams";

export const dynamic = "force-dynamic";

export default function RankingPage() {
  const results = getResults();
  const resultsReady = hasResults();
  const entries = getAllPredictions();

  const rows = entries
    .map(({ user, prediction }) => ({
      name: user.name,
      champion: prediction.bracket.final[0],
      ...scorePrediction(prediction, results),
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div>
      <h1>Clasificación</h1>
      {!resultsReady && (
        <div className="banner warn">
          Aún no se han introducido resultados reales. La tabla mostrará 0 puntos
          hasta que el administrador empiece a cargarlos.
        </div>
      )}
      {entries.length === 0 ? (
        <p className="muted">Todavía no hay porras guardadas.</p>
      ) : (
        <div className="card">
          <table className="rank">
            <thead>
              <tr>
                <th className="num">#</th>
                <th>Participante</th>
                <th>Su campeón</th>
                <th className="num">Grupos</th>
                <th className="num">Eliminatoria</th>
                <th className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const champ = getTeam(r.champion);
                return (
                  <tr key={i}>
                    <td className="num">{i + 1}</td>
                    <td>{r.name}</td>
                    <td>{champ ? `${champ.flag} ${champ.name}` : "—"}</td>
                    <td className="num">{r.groups}</td>
                    <td className="num">{r.knockout}</td>
                    <td className="num">
                      <strong>{r.total}</strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="small muted">
        Puntuación: 3 pts por equipo en su posición exacta de grupo; y por acertar
        equipos que llegan a octavos (+3), cuartos (+5), semis (+8), final (+12) y
        campeón (+20).
      </p>
    </div>
  );
}
