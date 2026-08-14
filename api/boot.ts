import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
// Point de santé pour la plateforme de déploiement
app.get("/healthz", (c) => c.json({ ok: true }));
app.get("/api/healthz", (c) => c.json({ ok: true }));
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
// Initialisation de la base (schéma + données par défaut) — protégé par JWT_SECRET
app.post("/api/bootstrap", async (c) => {
  const auth = c.req.header("x-bootstrap-key") ?? "";
  const secret = process.env.JWT_SECRET ?? "";
  if (!secret || auth !== secret) return c.json({ error: "Forbidden" }, 403);
  try {
    const { bootstrapDatabase } = await import("./lib/bootstrap");
    const result = await bootstrapDatabase();
    return c.json(result);
  } catch (e: any) {
    return c.json({ ok: false, error: String(e?.message ?? e) }, 500);
  }
});

// Export Excel des données admin — GET /api/export/:name?token=<jwt>
app.get("/api/export/:name", async (c) => {
  const token = c.req.query("token") ?? "";
  const { verifyAdminToken, buildExcel } = await import("./lib/export-excel");
  if (!verifyAdminToken(token)) return c.json({ error: "Forbidden" }, 403);
  try {
    const file = await buildExcel(c.req.param("name"));
    if (!file) return c.json({ error: "Jeu de données inconnu" }, 404);
    return new Response(new Uint8Array(file.buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${file.filename}"`,
      },
    });
  } catch (e: any) {
    return c.json({ ok: false, error: String(e?.message ?? e) }, 500);
  }
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  // Bootstrap automatique : schéma + données par défaut en arrière-plan
  // (idempotent, jamais fatal). Remplace l'ancien ensure basé sur npx/tsx.
  import("./lib/bootstrap")
    .then(({ bootstrapDatabase }) => bootstrapDatabase())
    .then((r) => console.log("[bootstrap]", JSON.stringify(r.steps)))
    .catch((e) => console.error("[bootstrap]", e?.message ?? e));
}
