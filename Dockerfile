# UNIMPRESA Sicilia — site vitrine + panneau Super Admin (full-stack)
# Build multi-étapes : image finale légère, démarrage instantané.

# ── Étape 1 : installation des dépendances de build ──────────────────────────
FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ── Étape 2 : build frontend (Vite) + bundle serveur (esbuild) ───────────────
COPY . .
RUN npm run build

# ── Étape 3 : image finale de production ─────────────────────────────────────
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production

# Seules les dépendances nécessaires au runtime : le serveur est déjà bundlé
# par esbuild (dist/boot.js est autonome), on ne garde que les assets statiques
# et le bundle. drizzle-kit/tsx servent à l'ensure-db en arrière-plan.
COPY --from=build /app/dist ./dist
COPY --from=build /app/db ./db
COPY --from=build /app/api ./api
COPY --from=build /app/drizzle.config.ts ./
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000
# Le serveur écoute immédiatement ; schéma + seed se font en arrière-plan.
CMD ["node", "dist/boot.js"]
