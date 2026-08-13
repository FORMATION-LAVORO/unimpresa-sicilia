import { z } from "zod";
import { asc, desc, eq } from "drizzle-orm";
import nodemailer from "nodemailer";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  cycles,
  filieres,
  tarifs,
  etapes,
  parametres,
  inscriptions,
  partenaires,
  avantages,
  rendezVous,
} from "../db/schema";
import {
  FALLBACK_CYCLE,
  FALLBACK_PARAMS,
  FALLBACK_FILIERES,
  FALLBACK_TARIFS,
  FALLBACK_ETAPES,
} from "./lib/fallback";

/** Données de repli si la BDD est injoignable — le site reste affichable */
function fallbackPublicData() {
  return {
    cycle: FALLBACK_CYCLE as any,
    cycles: [FALLBACK_CYCLE as any],
    filieres: FALLBACK_FILIERES as any,
    tarifs: FALLBACK_TARIFS as any,
    etapes: FALLBACK_ETAPES as any,
    partenaires: [] as any[],
    avantages: [] as any[],
    params: FALLBACK_PARAMS,
  };
}

/** Récupère tous les paramètres globaux sous forme de map clé → valeur */
async function getParamsMap(): Promise<Record<string, string>> {
  const rows = await getDb().select().from(parametres);
  return Object.fromEntries(rows.map((r) => [r.cle, r.valeur]));
}

/** Cycle actif le plus récent (fallback : n'importe quel cycle) */
async function getActiveCycle() {
  const db = getDb();
  const [actif] = await db
    .select()
    .from(cycles)
    .where(eq(cycles.actif, true))
    .orderBy(desc(cycles.id))
    .limit(1);
  if (actif) return actif;
  const [any] = await db.select().from(cycles).orderBy(desc(cycles.id)).limit(1);
  return any ?? null;
}

/** Envoie une notification email au Super Admin si SMTP est configuré */
async function notifyAdminByEmail(subject: string, body: string) {
  const host = process.env.SMTP_HOST;
  const to = process.env.ADMIN_EMAIL;
  if (!host || !to) {
    console.log(`[mail désactivé] ${subject}\n${body}`);
    return;
  }
  try {
    const transport = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
    await transport.sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to,
      subject,
      text: body,
    });
  } catch (err) {
    console.error("Échec envoi email admin:", err);
  }
}

export const siteRouter = createRouter({
  /** Données publiques de la page d'accueil — tout vient de la BDD */
  publicData: publicQuery.query(async () => {
    try {
      const db = getDb();
      const cycle = await getActiveCycle();
      const [fil, tar, eta, params, allCycles, part, avan] = await Promise.all([
        db.select().from(filieres).where(eq(filieres.actif, true)).orderBy(asc(filieres.ordre), asc(filieres.id)),
        db.select().from(tarifs).orderBy(asc(tarifs.ordre), asc(tarifs.id)),
        db.select().from(etapes).orderBy(asc(etapes.ordre), asc(etapes.id)),
        getParamsMap(),
        db.select().from(cycles).orderBy(desc(cycles.id)),
        db.select().from(partenaires).where(eq(partenaires.actif, true)).orderBy(asc(partenaires.ordre), asc(partenaires.id)),
        db.select().from(avantages).where(eq(avantages.actif, true)).orderBy(asc(avantages.ordre), asc(avantages.id)),
      ]);
      // BDD vide (seed pas encore exécuté) → valeurs par défaut des captures
      if (!cycle && fil.length === 0 && tar.length === 0 && eta.length === 0) {
        return { ...fallbackPublicData(), partenaires: part, avantages: avan };
      }
      return {
        cycle,
        cycles: allCycles.length ? allCycles : [FALLBACK_CYCLE as any],
        filieres: cycle ? fil.filter((f) => f.cycleId == null || f.cycleId === cycle.id) : fil,
        tarifs: cycle ? tar.filter((t) => t.cycleId == null || t.cycleId === cycle.id) : tar,
        etapes: cycle ? eta.filter((e) => e.cycleId == null || e.cycleId === cycle.id) : eta,
        partenaires: part,
        avantages: avan,
        params: { ...FALLBACK_PARAMS, ...params },
      };
    } catch (err) {
      console.error("publicData: BDD injoignable, mode dégradé:", err);
      return fallbackPublicData();
    }
  }),

  /** Formulaire public d'inscription candidat (dossier complet) */
  inscrire: publicQuery
    .input(
      z.object({
        nom: z.string().min(1).max(100),
        prenom: z.string().min(1).max(100),
        email: z.string().email().max(255),
        telephone: z.string().min(5).max(50),
        filiereId: z.number(),
        cycleId: z.number(),
        dateNaissance: z.string().max(30).default(""),
        lieuNaissance: z.string().max(150).default(""),
        sexe: z.string().max(20).default(""),
        situationFamiliale: z.string().max(30).default(""),
        documents: z.string().default(""),
        adresse: z.string().max(255).default(""),
        urgenceNom: z.string().max(150).default(""),
        urgenceTelephone: z.string().max(50).default(""),
        enActivite: z.string().max(10).default(""),
        profession: z.string().max(150).default(""),
        employeur: z.string().max(150).default(""),
        metierChoisi: z.string().max(150).default(""),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [fil] = await db.select().from(filieres).where(eq(filieres.id, input.filiereId)).limit(1);
      const [cyc] = await db.select().from(cycles).where(eq(cycles.id, input.cycleId)).limit(1);
      // Numéro de dossier unique façon site principal : US-2026-XXXX
      const [last] = await db.select().from(inscriptions).orderBy(desc(inscriptions.id)).limit(1);
      const seq = (last ? Number(last.id) : 0) + 1;
      const numeroDossier = `US-${new Date().getFullYear()}-${String(seq).padStart(4, "0")}`;
      await db.insert(inscriptions).values({
        numeroDossier,
        nom: input.nom,
        prenom: input.prenom,
        email: input.email,
        telephone: input.telephone,
        filiereId: input.filiereId,
        filiereLabel: fil?.titre ?? "",
        cycleId: input.cycleId,
        cycleLabel: cyc?.nom ?? "",
        dateNaissance: input.dateNaissance,
        lieuNaissance: input.lieuNaissance,
        sexe: input.sexe,
        situationFamiliale: input.situationFamiliale,
        documents: input.documents,
        adresse: input.adresse,
        urgenceNom: input.urgenceNom,
        urgenceTelephone: input.urgenceTelephone,
        enActivite: input.enActivite,
        profession: input.profession,
        employeur: input.employeur,
        metierChoisi: input.metierChoisi,
      });
      await notifyAdminByEmail(
        `Nouvelle inscription ${numeroDossier} — ${input.prenom} ${input.nom}`,
        [
          `Dossier : ${numeroDossier}`,
          `Nom : ${input.nom}`,
          `Prénom : ${input.prenom}`,
          `Email : ${input.email}`,
          `Téléphone : ${input.telephone}`,
          `Filière : ${fil?.titre ?? input.filiereId}`,
          `Métier : ${input.metierChoisi}`,
          `Cycle : ${cyc?.nom ?? input.cycleId}`,
        ].join("\n"),
      );
      return { ok: true, numeroDossier };
    }),

  /** Prise de rendez-vous */
  prendreRdv: publicQuery
    .input(
      z.object({
        prenom: z.string().min(1).max(100),
        nom: z.string().min(1).max(100),
        telephone: z.string().min(5).max(50),
        email: z.string().max(255).default(""),
        motif: z.string().default(""),
        dateSouhaitee: z.string().max(50).default(""),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(rendezVous).values({
        prenom: input.prenom,
        nom: input.nom,
        telephone: input.telephone,
        email: input.email,
        motif: input.motif,
        dateSouhaitee: input.dateSouhaitee,
      });
      await notifyAdminByEmail(
        `Nouveau rendez-vous — ${input.prenom} ${input.nom}`,
        `Téléphone : ${input.telephone}\nEmail : ${input.email}\nMotif : ${input.motif}\nDate souhaitée : ${input.dateSouhaitee}`,
      );
      return { ok: true };
    }),
});
