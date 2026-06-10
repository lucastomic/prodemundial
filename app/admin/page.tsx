import PorraEditor from "../PorraEditor";
import { adminLoginAction, adminLogoutAction, saveResultsAction } from "../actions";
import { getResults } from "@/lib/db";
import { isAdmin } from "@/lib/session";
import { Banner } from "../components/Banner";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const admin = isAdmin();
  const passwordConfigured = !!process.env.ADMIN_PASSWORD;

  if (!admin) {
    return (
      <div className="wrap wrap-narrow">
        <span className="eyebrow">Administración</span>
        <h1 className="title" style={{ marginTop: 12, marginBottom: 24 }}>
          Acceso restringido
        </h1>
        <div className="card signup-card">
          <h2>Entrar como administrador</h2>
          <p className="sub">
            Introduce la contraseña para cargar los resultados reales del torneo.
          </p>
          {!passwordConfigured && (
            <div style={{ marginBottom: 14 }}>
              <Banner kind="err">
                No hay <code>ADMIN_PASSWORD</code> configurada. Define la variable
                de entorno para poder entrar.
              </Banner>
            </div>
          )}
          {searchParams.error && (
            <div style={{ marginBottom: 14 }}>
              <Banner kind="err">Contraseña incorrecta.</Banner>
            </div>
          )}
          <form action={adminLoginAction}>
            <div className="field">
              <label className="label" htmlFor="password">
                Contraseña de administrador
              </label>
              <input
                id="password"
                name="password"
                className="input"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              className="btn btn-primary btn-lg"
              type="submit"
              style={{ width: "100%" }}
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  const results = await getResults();

  return (
    <>
      <PorraEditor
        initial={results}
        readOnly={false}
        onSave={saveResultsAction}
        mode="admin"
      />
      <form
        action={adminLogoutAction}
        style={{
          position: "fixed",
          top: 70,
          right: 16,
          zIndex: 60,
        }}
      >
        <button type="submit" className="btn btn-ghost">
          Cerrar sesión
        </button>
      </form>
    </>
  );
}
