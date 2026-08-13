import { createRouter, publicQuery } from "./middleware";
import { siteRouter } from "./site-router";
import { adminRouter } from "./admin-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  site: siteRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
