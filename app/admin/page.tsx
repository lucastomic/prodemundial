import PorraEditor from "../PorraEditor";
import { adminLoginAction, adminLogoutAction, saveResultsAction } from "../actions";
import { getResults } from "@/lib/db";
import { isAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default function AdminPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const admin = isAdmin();
  const passwordConfigured = !!process.env.ADMIN_PASSWORD;

  if (!admin) {
    return (
      <div>
        <h1>Administración</h1>
        {!passwordConfigured && (
          <div className="banner error">
            No hay <code>ADMIN_PASSWORD</code> configurada. Define la variable de
            entorno para poder entrar.
          </div>
        )}
        {searchParams.error && (
          <div className="banner error">Contraseña incorrecta.</div>
        )}
        <div className="card">
          <form action={adminLoginAction}>
            <label htmlFor="password">Contraseña de administrador</label>
            <input id="password" name="password" type="password" required />
            <div style={{ marginTop: 14 }}>
              <button className="btn-primary" type="submit">
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const results = getResults();

  return (
    <div>
      <h1>Resultados reales</h1>
      <p className="muted small">
        Introduce el orden real de los grupos, los terceros que realmente
        clasificaron y los ganadores reales de la eliminatoria. La clasificación
        se recalcula automáticamente.
      </p>
      <form action={adminLogoutAction} style={{ marginBottom: 8 }}>
        <button type="submit">Cerrar sesión de admin</button>
      </form>
      <PorraEditor
        initial={results}
        readOnly={false}
        onSave={saveResultsAction}
        mode="admin"
      />
    </div>
  );
}
