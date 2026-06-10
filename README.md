# Porra del Mundial 2026 ⚽🏆

App web sencilla para hacer una porra del Mundial 2026 (48 equipos, 12 grupos).
Sin contraseñas ni registro complejo: cada usuario entra solo con su nombre,
**ordena los 12 grupos**, elige los **8 mejores terceros** y completa el
**cuadro eliminatorio** hasta el campeón. **No se predicen resultados exactos.**
Un administrador introduce los resultados reales y la app calcula los puntos y
muestra la **clasificación**.

## Stack

- **Next.js 14** (App Router, Server Actions) + TypeScript
- **SQLite** vía `better-sqlite3` (archivo local, sin servicios externos)

## Puesta en marcha

```bash
npm install
cp .env.example .env   # edita ADMIN_PASSWORD y LOCK_AT
npm run dev            # http://localhost:3000
```

Para producción:

```bash
npm run build
npm start
```

## Variables de entorno (`.env`)

| Variable         | Descripción                                                        |
| ---------------- | ------------------------------------------------------------------ |
| `ADMIN_PASSWORD` | Contraseña para entrar en `/admin`.                                |
| `LOCK_AT`        | Fecha/hora ISO de cierre. Pasada esa fecha las porras son de solo lectura. |
| `DB_PATH`        | (Opcional) Ruta del archivo SQLite. Por defecto `./data/porra.db`. |

## Cómo funciona

- **`/`** — alta del participante (solo nombre). Se guarda un token en cookie y
  se ofrece un **enlace personal** (`/resume?t=<token>`) para retomar la porra
  desde otro dispositivo.
- **`/porra`** — editor: ordenar grupos (▲▼), elegir 8 terceros y rellenar el
  cuadro. Se puede guardar tantas veces como se quiera hasta `LOCK_AT`.
- **`/ranking`** — clasificación de todos los participantes (pública).
- **`/admin`** — login con `ADMIN_PASSWORD`; usa el mismo editor para meter los
  **resultados reales**.

## Puntuación

Configurable en `lib/scoring.ts`:

- **Grupos**: +3 por cada equipo en su **posición exacta**.
- **Eliminatoria** (por equipo acertado que alcanza la ronda): octavos +3,
  cuartos +5, semis +8, final +12, **campeón +20**.

## ⚠️ Antes de abrir las porras: verifica los equipos

Los grupos y equipos de `data/teams.ts` son una **plantilla de partida** y deben
**verificarse/editarse** para coincidir con el sorteo oficial del Mundial 2026
(incluidas las plazas de repesca). No cambies los `id` de equipo una vez que la
gente haya empezado a guardar porras.

## Nota sobre el cuadro

La asignación de los 8 mejores terceros a los dieciseisavos es una **siembra
determinista y simplificada** (no reproduce la matriz oficial de terceros de la
FIFA), elegida para mantener la app sencilla. Ver `lib/bracket.ts`.

## Despliegue

SQLite necesita un **disco persistente**. Recomendado: Fly.io, Railway o un VPS
con volumen montado donde viva `data/porra.db`. En plataformas serverless con
sistema de archivos efímero (p. ej. Vercel) los datos se perderían; en ese caso
usa una base SQLite gestionada (Turso/libSQL) o un Postgres.
