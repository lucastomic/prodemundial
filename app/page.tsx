import Link from "next/link";
import { createUserAction } from "./actions";
import { getCurrentUser, isLocked, lockAt } from "@/lib/session";

export const dynamic = "force-dynamic";

export default function HomePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const user = getCurrentUser();
  const locked = isLocked();
  const lock = lockAt();

  if (user) {
    return (
      <div>
        <h1>¡Hola, {user.name}! 👋</h1>
        <p className="muted">Ya estás dado de alta en la porra.</p>
        <div className="card">
          <Link href="/porra" className="btn btn-primary">
            Ir a mi porra →
          </Link>{" "}
          <Link href="/ranking" className="btn">
            Ver clasificación
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Haz tu porra del Mundial 2026 🏆</h1>
      <p className="muted">
        Ordena los 12 grupos, elige los mejores terceros y completa el cuadro
        hasta el campeón. Sin contraseñas: solo tu nombre.
      </p>

      {searchParams.error === "nombre" && (
        <div className="banner error">Escribe tu nombre para continuar.</div>
      )}
      {searchParams.error === "enlace" && (
        <div className="banner error">
          Ese enlace para retomar la porra no es válido.
        </div>
      )}
      {locked && (
        <div className="banner warn">
          Las porras están cerradas
          {lock ? ` (cierre: ${lock.toLocaleString("es-ES")})` : ""}. Aún puedes
          registrarte y ver la clasificación, pero no editar.
        </div>
      )}

      <div className="card">
        <form action={createUserAction}>
          <label htmlFor="name">Tu nombre</label>
          <input id="name" name="name" type="text" placeholder="Ej. Lucas" required />
          <label htmlFor="email">Email (opcional)</label>
          <input id="email" name="email" type="email" placeholder="opcional" />
          <div style={{ marginTop: 14 }}>
            <button className="btn-primary" type="submit">
              Empezar mi porra
            </button>
          </div>
        </form>
      </div>

      <p className="small muted">
        ¿Ya tienes una porra en otro dispositivo? Usa el enlace personal que se
        te mostró al guardar.
      </p>
    </div>
  );
}
