import { z } from "zod";
import { asc, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { numberToLetters, parseNumber } from "./lib/number-to-letters";
import {
  cycles,
  filieres,
  tarifs,
  etapes,
  parametres,
  admins,
  inscriptions,
  partenaires,
  avantages,
  rendezVous,
} from "../db/schema";

const JWT_SECRET = process.env.JWT_SECRET ?? "unimpresa-dev-secret";
const TOKEN_TTL = "12h";

/** Vérifie le token JWT admin — lève UNAUTHORIZED si invalide */
function requireAdmin(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as unknown as { sub: number; role: string };
  } catch {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Session expirée, reconnectez-vous." });
  }
}

const withToken = { token: z.string().min(1) };

const cycleInput = z.object({
  nom: z.string().min(1),
  dateDebut: z.string().min(1),
  dateFin: z.string().min(1),
  sessionLabel: z.string().default(""),
  dureeHeures: z.string().min(1),
  nbParticipants: z.number().int().min(0),
  lieu: z.string().min(1),
  ville: z.string().default("Dakar"),
  pays: z.string().default("Sénégal"),
  actif: z.boolean().default(true),
});

const filiereInput = z.object({
  cycleId: z.number().nullable().default(null),
  titre: z.string().min(1),
  description: z.string().min(1),
  dureeHeures: z.string().min(1),
  nbMetiers: z.number().int().min(0),
  icone: z.string().default("📚"),
  badge: z.string().default(""),
  metiers: z.string().default(""),
  ordre: z.number().int().default(0),
  actif: z.boolean().default(true),
});

const tarifInput = z.object({
  cycleId: z.number().nullable().default(null),
  label: z.string().min(1),
  montantChiffres: z.string().min(1),
  montantLettres: z.string().default(""),
  description: z.string().default(""),
  estTotal: z.boolean().default(false),
  ordre: z.number().int().default(0),
});

const etapeInput = z.object({
  cycleId: z.number().nullable().default(null),
  numero: z.string().min(1),
  icone: z.string().default("📌"),
  titre: z.string().min(1),
  description: z.string().min(1),
  ordre: z.number().int().default(0),
});

export const adminRouter = createRouter({
  /** Connexion Super Admin (bcrypt + JWT) */
  login: publicQuery
    .input(z.object({ username: z.string().min(1), password: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [admin] = await db.select().from(admins).where(eq(admins.username, input.username)).limit(1);
      if (!admin || !(await bcrypt.compare(input.password, admin.passwordHash))) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Identifiants incorrects." });
      }
      const token = jwt.sign({ sub: Number(admin.id), role: admin.role }, JWT_SECRET, { expiresIn: TOKEN_TTL });
      return { token, username: admin.username, role: admin.role };
    }),

  /** Statistiques du tableau de bord */
  stats: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    const db = getDb();
    const count = async (t: any) => (await db.select().from(t as any)).length;
    return {
      cycles: await count(cycles),
      filieres: await count(filieres),
      tarifs: await count(tarifs),
      etapes: await count(etapes),
      inscriptions: await count(inscriptions),
      parametres: await count(parametres),
    };
  }),

  // ─── CYCLES ─────────────────────────────────────────────────────────────
  listCycles: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    return getDb().select().from(cycles).orderBy(desc(cycles.id));
  }),
  createCycle: publicQuery.input(z.object({ ...withToken, data: cycleInput })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    const [r] = await getDb().insert(cycles).values(input.data).returning({ id: cycles.id });
    return { id: Number(r.id) };
  }),
  updateCycle: publicQuery.input(z.object({ ...withToken, id: z.number(), data: cycleInput.partial() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().update(cycles).set(input.data).where(eq(cycles.id, input.id));
    return { ok: true };
  }),
  deleteCycle: publicQuery.input(z.object({ ...withToken, id: z.number() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().delete(cycles).where(eq(cycles.id, input.id));
    return { ok: true };
  }),

  // ─── FILIÈRES ───────────────────────────────────────────────────────────
  listFilieres: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    return getDb().select().from(filieres).orderBy(asc(filieres.ordre), asc(filieres.id));
  }),
  createFiliere: publicQuery.input(z.object({ ...withToken, data: filiereInput })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    const [r] = await getDb().insert(filieres).values(input.data).returning({ id: filieres.id });
    return { id: Number(r.id) };
  }),
  updateFiliere: publicQuery.input(z.object({ ...withToken, id: z.number(), data: filiereInput.partial() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().update(filieres).set(input.data).where(eq(filieres.id, input.id));
    return { ok: true };
  }),
  deleteFiliere: publicQuery.input(z.object({ ...withToken, id: z.number() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().delete(filieres).where(eq(filieres.id, input.id));
    return { ok: true };
  }),

  // ─── TARIFS ─────────────────────────────────────────────────────────────
  listTarifs: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    return getDb().select().from(tarifs).orderBy(asc(tarifs.ordre), asc(tarifs.id));
  }),
  createTarif: publicQuery.input(z.object({ ...withToken, data: tarifInput })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    const data = { ...input.data };
    // Auto-génère le montant en lettres si vide ou si le montant a changé
    if (!data.montantLettres || data.montantLettres.trim() === "") {
      const num = parseNumber(data.montantChiffres);
      data.montantLettres = num > 0 ? numberToLetters(num) : "";
    }
    const [r] = await getDb().insert(tarifs).values(data).returning({ id: tarifs.id });
    return { id: Number(r.id) };
  }),
  updateTarif: publicQuery.input(z.object({ ...withToken, id: z.number(), data: tarifInput.partial() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    const data = { ...input.data };
    // Si le montant en chiffres change, régénère les lettres
    if (data.montantChiffres !== undefined) {
      const num = parseNumber(data.montantChiffres);
      data.montantLettres = num > 0 ? numberToLetters(num) : "";
    }
    await getDb().update(tarifs).set(data).where(eq(tarifs.id, input.id));
    return { ok: true };
  }),
  deleteTarif: publicQuery.input(z.object({ ...withToken, id: z.number() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().delete(tarifs).where(eq(tarifs.id, input.id));
    return { ok: true };
  }),

  // ─── ÉTAPES (timeline) ─────────────────────────────────────────────────
  listEtapes: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    return getDb().select().from(etapes).orderBy(asc(etapes.ordre), asc(etapes.id));
  }),
  createEtape: publicQuery.input(z.object({ ...withToken, data: etapeInput })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    const [r] = await getDb().insert(etapes).values(input.data).returning({ id: etapes.id });
    return { id: Number(r.id) };
  }),
  updateEtape: publicQuery.input(z.object({ ...withToken, id: z.number(), data: etapeInput.partial() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().update(etapes).set(input.data).where(eq(etapes.id, input.id));
    return { ok: true };
  }),
  deleteEtape: publicQuery.input(z.object({ ...withToken, id: z.number() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().delete(etapes).where(eq(etapes.id, input.id));
    return { ok: true };
  }),
  /** Réordonne les étapes : liste ordonnée d'ids */
  reorderEtapes: publicQuery.input(z.object({ ...withToken, ids: z.array(z.number()) })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    const db = getDb();
    await Promise.all(input.ids.map((id, i) => db.update(etapes).set({ ordre: i + 1 }).where(eq(etapes.id, id))));
    return { ok: true };
  }),

  // ─── PARAMÈTRES (textes globaux, couleurs, contact, logo) ─────────────
  listParametres: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    return getDb().select().from(parametres).orderBy(asc(parametres.cle));
  }),
  setParametre: publicQuery.input(z.object({ ...withToken, cle: z.string().min(1).max(100), valeur: z.string() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    const db = getDb();
    const [existing] = await db.select().from(parametres).where(eq(parametres.cle, input.cle)).limit(1);
    if (existing) {
      await db.update(parametres).set({ valeur: input.valeur }).where(eq(parametres.cle, input.cle));
    } else {
      await db.insert(parametres).values({ cle: input.cle, valeur: input.valeur });
    }
    return { ok: true };
  }),

  // ─── INSCRIPTIONS ──────────────────────────────────────────────────────
  listInscriptions: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    return getDb().select().from(inscriptions).orderBy(desc(inscriptions.id));
  }),
  updateInscription: publicQuery
    .input(z.object({ ...withToken, id: z.number(), statut: z.string().min(1).max(50) }))
    .mutation(async ({ input }) => {
      requireAdmin(input.token);
      await getDb().update(inscriptions).set({ statut: input.statut }).where(eq(inscriptions.id, input.id));
      return { ok: true };
    }),
  deleteInscription: publicQuery.input(z.object({ ...withToken, id: z.number() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().delete(inscriptions).where(eq(inscriptions.id, input.id));
    return { ok: true };
  }),

  // ─── PARTENAIRES ───────────────────────────────────────────────────────
  listPartenaires: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    return getDb().select().from(partenaires).orderBy(asc(partenaires.ordre), asc(partenaires.id));
  }),
  createPartenaire: publicQuery
    .input(z.object({ ...withToken, data: z.object({ nom: z.string().min(1), description: z.string().default(""), logo: z.string().default(""), ordre: z.number().int().default(0), actif: z.boolean().default(true) }) }))
    .mutation(async ({ input }) => {
      requireAdmin(input.token);
      const [r] = await getDb().insert(partenaires).values(input.data).returning({ id: partenaires.id });
      return { id: Number(r.id) };
    }),
  updatePartenaire: publicQuery
    .input(z.object({ ...withToken, id: z.number(), data: z.object({ nom: z.string(), description: z.string(), logo: z.string(), ordre: z.number().int(), actif: z.boolean() }).partial() }))
    .mutation(async ({ input }) => {
      requireAdmin(input.token);
      await getDb().update(partenaires).set(input.data).where(eq(partenaires.id, input.id));
      return { ok: true };
    }),
  deletePartenaire: publicQuery.input(z.object({ ...withToken, id: z.number() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().delete(partenaires).where(eq(partenaires.id, input.id));
    return { ok: true };
  }),

  // ─── AVANTAGES ─────────────────────────────────────────────────────────
  listAvantages: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    return getDb().select().from(avantages).orderBy(asc(avantages.ordre), asc(avantages.id));
  }),
  createAvantage: publicQuery
    .input(z.object({ ...withToken, data: z.object({ icone: z.string().default("✅"), titre: z.string().min(1), description: z.string().default(""), ordre: z.number().int().default(0), actif: z.boolean().default(true) }) }))
    .mutation(async ({ input }) => {
      requireAdmin(input.token);
      const [r] = await getDb().insert(avantages).values(input.data).returning({ id: avantages.id });
      return { id: Number(r.id) };
    }),
  updateAvantage: publicQuery
    .input(z.object({ ...withToken, id: z.number(), data: z.object({ icone: z.string(), titre: z.string(), description: z.string(), ordre: z.number().int(), actif: z.boolean() }).partial() }))
    .mutation(async ({ input }) => {
      requireAdmin(input.token);
      await getDb().update(avantages).set(input.data).where(eq(avantages.id, input.id));
      return { ok: true };
    }),
  deleteAvantage: publicQuery.input(z.object({ ...withToken, id: z.number() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().delete(avantages).where(eq(avantages.id, input.id));
    return { ok: true };
  }),

  // ─── RENDEZ-VOUS ───────────────────────────────────────────────────────
  listRendezVous: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    return getDb().select().from(rendezVous).orderBy(desc(rendezVous.id));
  }),
  updateRendezVous: publicQuery
    .input(z.object({ ...withToken, id: z.number(), statut: z.string().min(1).max(50) }))
    .mutation(async ({ input }) => {
      requireAdmin(input.token);
      await getDb().update(rendezVous).set({ statut: input.statut }).where(eq(rendezVous.id, input.id));
      return { ok: true };
    }),
  deleteRendezVous: publicQuery.input(z.object({ ...withToken, id: z.number() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().delete(rendezVous).where(eq(rendezVous.id, input.id));
    return { ok: true };
  }),

  /** Changer le mot de passe admin */
  changePassword: publicQuery
    .input(z.object({ ...withToken, oldPassword: z.string(), newPassword: z.string().min(6) }))
    .mutation(async ({ input }) => {
      const payload = requireAdmin(input.token);
      const db = getDb();
      const [admin] = await db.select().from(admins).where(eq(admins.id, payload.sub)).limit(1);
      if (!admin || !(await bcrypt.compare(input.oldPassword, admin.passwordHash))) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Ancien mot de passe incorrect." });
      }
      await db.update(admins).set({ passwordHash: await bcrypt.hash(input.newPassword, 10) }).where(eq(admins.id, admin.id));
      return { ok: true };
    }),
});
