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
  travailleurs,
  offresEmploi,
  matchings,
  transactions,
  salles,
  placements,
  tuteurs,
  paiements,
  centres,
  modules,
  progressions,
  etapesVisa,
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

const travailleurInput = z.object({
  inscriptionId: z.number().nullable().default(null),
  nom: z.string().min(1),
  prenom: z.string().min(1),
  dateNaissance: z.string().default(""),
  age: z.number().int().min(0).default(0),
  sexe: z.string().default(""),
  situationFamiliale: z.string().default(""),
  qualification: z.string().default(""),
  telephone: z.string().default(""),
  email: z.string().default(""),
  profession: z.string().default(""),
  competences: z.string().default(""),
  experienceAnnees: z.number().int().min(0).default(0),
  niveauItalien: z.string().default("débutant"),
  autresLangues: z.string().default(""),
  filiereId: z.number().nullable().default(null),
  metier: z.string().default(""),
  statut: z.string().default("en_formation"),
  notes: z.string().default(""),
});

const offreInput = z.object({
  titre: z.string().min(1),
  entreprise: z.string().default(""),
  ville: z.string().default(""),
  filiereId: z.number().nullable().default(null),
  metier: z.string().default(""),
  typeContrat: z.string().default(""),
  salaire: z.string().default(""),
  description: z.string().default(""),
  statut: z.string().default("ouverte"),
});

const matchingInput = z.object({
  travailleurId: z.number(),
  offreId: z.number().nullable().default(null),
  filiereId: z.number().nullable().default(null),
  type: z.string().default("emploi"),
  score: z.number().int().default(0),
  statut: z.string().default("proposé"),
  notes: z.string().default(""),
});

const transactionInput = z.object({
  date: z.string().min(1),
  type: z.string().default("recette"),
  categorie: z.string().default(""),
  libelle: z.string().min(1),
  montantChiffres: z.string().min(1),
  montantLettres: z.string().default(""),
  modePaiement: z.string().default("espèces"),
  inscriptionId: z.number().nullable().default(null),
  notes: z.string().default(""),
});

const salleInput = z.object({
  nom: z.string().min(1),
  type: z.string().default("salle"),
  capacite: z.number().int().min(0).default(30),
  occupation: z.number().int().min(0).default(0),
  equipements: z.string().default(""),
  localisation: z.string().default(""),
  seuilAlerte: z.number().int().min(1).max(100).default(90),
  actif: z.boolean().default(true),
});

const placementInput = z.object({
  travailleurId: z.number().nullable().default(null),
  inscriptionId: z.number().nullable().default(null),
  nomComplet: z.string().default(""),
  type: z.string().default("reussite"),
  entreprise: z.string().default(""),
  poste: z.string().default(""),
  ville: z.string().default(""),
  typeContrat: z.string().default(""),
  dateEvenement: z.string().default(""),
  salaire: z.string().default(""),
  statut: z.string().default("en_cours"),
  notes: z.string().default(""),
});

const tuteurInput = z.object({
  nom: z.string().min(1),
  prenom: z.string().min(1),
  role: z.string().default("enseignant"),
  specialite: z.string().default(""),
  filiereId: z.number().nullable().default(null),
  telephone: z.string().default(""),
  email: z.string().default(""),
  langues: z.string().default(""),
  statut: z.string().default("actif"),
  notes: z.string().default(""),
});

const paiementInput = z.object({
  inscriptionId: z.number(),
  date: z.string().min(1),
  nature: z.string().default("inscription"),
  montantChiffres: z.string().min(1),
  montantLettres: z.string().default(""),
  modePaiement: z.string().default("espèces"),
  reference: z.string().default(""),
  notes: z.string().default(""),
});

const centreInput = z.object({
  nom: z.string().min(1),
  partenaire: z.string().default(""),
  typePartenaire: z.string().default("privé"),
  adresse: z.string().default(""),
  ville: z.string().default("Dakar"),
  capacite: z.number().int().min(0).default(0),
  contact: z.string().default(""),
  statut: z.string().default("actif"),
});

const moduleInput = z.object({
  cycleId: z.number().nullable().default(null),
  filiereId: z.number().nullable().default(null),
  titre: z.string().min(1),
  dureeHeures: z.number().int().min(0).default(0),
  ordre: z.number().int().default(0),
  actif: z.boolean().default(true),
});

const progressionInput = z.object({
  inscriptionId: z.number(),
  moduleId: z.number(),
  heuresFaites: z.number().int().min(0).default(0),
  statut: z.string().default("en_cours"),
  dateValidation: z.string().default(""),
});

const etapeVisaInput = z.object({
  inscriptionId: z.number(),
  travailleurId: z.number().nullable().default(null),
  entreprise: z.string().default(""),
  poste: z.string().default(""),
  localite: z.string().default(""),
  salaire: z.string().default(""),
  typeContrat: z.string().default(""),
  datePrecontrat: z.string().default(""),
  dateNullaOsta: z.string().default(""),
  dateDepotVisa: z.string().default(""),
  resultatVisa: z.string().default(""),
  dateContrat: z.string().default(""),
  statut: z.string().default("precontrat"),
  notes: z.string().default(""),
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
      travailleurs: await count(travailleurs),
      offres: await count(offresEmploi),
      matchings: await count(matchings),
      transactions: await count(transactions),
      salles: await count(salles),
      placements: await count(placements),
      tuteurs: await count(tuteurs),
      paiements: await count(paiements),
      centres: await count(centres),
      modules: await count(modules),
      visas: await count(etapesVisa),
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
      const db = getDb();
      const [avant] = await db.select().from(inscriptions).where(eq(inscriptions.id, input.id)).limit(1);
      await db.update(inscriptions).set({ statut: input.statut }).where(eq(inscriptions.id, input.id));
      // Chaînage automatique : passage en « admis » → crée la fiche travailleur si absente
      if (avant && avant.statut !== "admis" && input.statut === "admis") {
        const [existe] = await db.select().from(travailleurs).where(eq(travailleurs.inscriptionId, avant.id)).limit(1);
        if (!existe) {
          let age = 0;
          const m = avant.dateNaissance.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/) ?? avant.dateNaissance.match(/(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/);
          if (m) {
            const year = avant.dateNaissance.startsWith(m[1]) && m[1].length === 4 ? Number(m[1]) : Number(m[3]);
            age = Math.max(0, new Date().getFullYear() - year);
          }
          await db.insert(travailleurs).values({
            inscriptionId: avant.id, nom: avant.nom, prenom: avant.prenom,
            dateNaissance: avant.dateNaissance, age, sexe: avant.sexe,
            situationFamiliale: avant.situationFamiliale,
            telephone: avant.telephone, email: avant.email,
            profession: avant.profession, filiereId: avant.filiereId, metier: avant.metierChoisi,
          });
        }
      }
      return { ok: true };
    }),

  /** Affecte un candidat à un centre et/ou une salle — met à jour les compteurs d'occupation */
  affecterCandidat: publicQuery
    .input(z.object({ ...withToken, id: z.number(), centreId: z.number().nullable(), salleId: z.number().nullable() }))
    .mutation(async ({ input }) => {
      requireAdmin(input.token);
      const db = getDb();
      const [avant] = await db.select().from(inscriptions).where(eq(inscriptions.id, input.id)).limit(1);
      if (!avant) throw new TRPCError({ code: "NOT_FOUND", message: "Inscription introuvable." });
      // Contrôle de capacité de la nouvelle salle
      if (input.salleId && Number(avant.salleId) !== input.salleId) {
        const [salle] = await db.select().from(salles).where(eq(salles.id, input.salleId)).limit(1);
        if (salle && salle.capacite > 0 && salle.occupation >= salle.capacite) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `La salle « ${salle.nom} » est pleine (${salle.capacite} places).` });
        }
      }
      // Décrémente les anciens compteurs
      if (avant.salleId && Number(avant.salleId) !== input.salleId) {
        const [old] = await db.select().from(salles).where(eq(salles.id, avant.salleId)).limit(1);
        if (old) await db.update(salles).set({ occupation: Math.max(0, old.occupation - 1) }).where(eq(salles.id, old.id));
      }
      // Incrémente la nouvelle salle
      if (input.salleId && Number(avant.salleId) !== input.salleId) {
        const [s] = await db.select().from(salles).where(eq(salles.id, input.salleId)).limit(1);
        if (s) await db.update(salles).set({ occupation: s.occupation + 1 }).where(eq(salles.id, s.id));
      }
      await db.update(inscriptions).set({ centreId: input.centreId, salleId: input.salleId }).where(eq(inscriptions.id, input.id));
      return { ok: true };
    }),

  /** Enregistre le résultat du test — « réussi » crée automatiquement une réussite */
  setResultatTest: publicQuery
    .input(z.object({ ...withToken, id: z.number(), resultat: z.string() }))
    .mutation(async ({ input }) => {
      requireAdmin(input.token);
      const db = getDb();
      const [ins] = await db.select().from(inscriptions).where(eq(inscriptions.id, input.id)).limit(1);
      if (!ins) throw new TRPCError({ code: "NOT_FOUND", message: "Inscription introuvable." });
      await db.update(inscriptions).set({ resultatTest: input.resultat }).where(eq(inscriptions.id, input.id));
      if (input.resultat === "réussi") {
        const [existe] = await db.select().from(placements).where(eq(placements.inscriptionId, ins.id)).limit(1);
        if (!existe) {
          await db.insert(placements).values({
            inscriptionId: ins.id,
            nomComplet: `${ins.prenom} ${ins.nom}`,
            type: "reussite",
            poste: ins.metierChoisi,
            dateEvenement: new Date().toISOString().slice(0, 10),
            statut: "confirmé",
            notes: "Réussite au test de formation",
          });
        }
      }
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

  /** Vue unifiée d'un candidat : inscription + paiements + affectation + test + travailleur */
  dossierCandidat: publicQuery
    .input(z.object({ ...withToken, id: z.number() }))
    .query(async ({ input }) => {
      requireAdmin(input.token);
      const db = getDb();
      const [ins] = await db.select().from(inscriptions).where(eq(inscriptions.id, input.id)).limit(1);
      if (!ins) throw new TRPCError({ code: "NOT_FOUND", message: "Inscription introuvable." });
      const pais = (await db.select().from(paiements)).filter((p) => Number(p.inscriptionId) === input.id);
      const paye = pais.reduce((s, p) => s + parseNumber(p.montantChiffres), 0);
      const tarifsRows = await db.select().from(tarifs);
      const total = tarifsRows.filter((t) => t.estTotal).reduce((s, t) => s + parseNumber(t.montantChiffres), 0)
        || tarifsRows.reduce((s, t) => s + parseNumber(t.montantChiffres), 0);
      const [trav] = await db.select().from(travailleurs).where(eq(travailleurs.inscriptionId, ins.id)).limit(1);
      const centre = ins.centreId ? (await db.select().from(centres).where(eq(centres.id, ins.centreId)).limit(1))[0] : null;
      const salle = ins.salleId ? (await db.select().from(salles).where(eq(salles.id, ins.salleId)).limit(1))[0] : null;
      const plac = (await db.select().from(placements)).filter((p) => Number(p.inscriptionId) === input.id);
      return { inscription: ins, paiements: pais, paye, total, reste: Math.max(0, total - paye), travailleur: trav ?? null, centre, salle, placements: plac };
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

  // ─── TRAVAILLEURS (profils professionnels) ─────────────────────────────
  listTravailleurs: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    return getDb().select().from(travailleurs).orderBy(desc(travailleurs.id));
  }),
  createTravailleur: publicQuery
    .input(z.object({ ...withToken, data: travailleurInput }))
    .mutation(async ({ input }) => {
      requireAdmin(input.token);
      const [r] = await getDb().insert(travailleurs).values(input.data).returning({ id: travailleurs.id });
      return { id: Number(r.id) };
    }),
  updateTravailleur: publicQuery
    .input(z.object({ ...withToken, id: z.number(), data: travailleurInput.partial() }))
    .mutation(async ({ input }) => {
      requireAdmin(input.token);
      await getDb().update(travailleurs).set(input.data).where(eq(travailleurs.id, input.id));
      return { ok: true };
    }),
  deleteTravailleur: publicQuery.input(z.object({ ...withToken, id: z.number() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().delete(travailleurs).where(eq(travailleurs.id, input.id));
    return { ok: true };
  }),
  /** Importe une inscription validée comme travailleur */
  importInscription: publicQuery.input(z.object({ ...withToken, id: z.number() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    const db = getDb();
    const [ins] = await db.select().from(inscriptions).where(eq(inscriptions.id, input.id)).limit(1);
    if (!ins) throw new TRPCError({ code: "NOT_FOUND", message: "Inscription introuvable." });
    let age = 0;
    const m = ins.dateNaissance.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/) ?? ins.dateNaissance.match(/(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/);
    if (m) {
      const year = ins.dateNaissance.startsWith(m[1]) && m[1].length === 4 ? Number(m[1]) : Number(m[3]);
      age = Math.max(0, new Date().getFullYear() - year);
    }
    const [r] = await db
      .insert(travailleurs)
      .values({
        inscriptionId: ins.id,
        nom: ins.nom,
        prenom: ins.prenom,
        dateNaissance: ins.dateNaissance,
        age,
        sexe: ins.sexe,
        telephone: ins.telephone,
        email: ins.email,
        profession: ins.profession,
        filiereId: ins.filiereId,
        metier: ins.metierChoisi,
        situationFamiliale: ins.situationFamiliale,
      })
      .returning({ id: travailleurs.id });
    return { id: Number(r.id) };
  }),

  // ─── OFFRES D'EMPLOI ───────────────────────────────────────────────────
  listOffres: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    return getDb().select().from(offresEmploi).orderBy(desc(offresEmploi.id));
  }),
  createOffre: publicQuery.input(z.object({ ...withToken, data: offreInput })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    const [r] = await getDb().insert(offresEmploi).values(input.data).returning({ id: offresEmploi.id });
    return { id: Number(r.id) };
  }),
  updateOffre: publicQuery.input(z.object({ ...withToken, id: z.number(), data: offreInput.partial() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().update(offresEmploi).set(input.data).where(eq(offresEmploi.id, input.id));
    return { ok: true };
  }),
  deleteOffre: publicQuery.input(z.object({ ...withToken, id: z.number() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().delete(offresEmploi).where(eq(offresEmploi.id, input.id));
    return { ok: true };
  }),

  // ─── MATCHING ──────────────────────────────────────────────────────────
  listMatchings: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    return getDb().select().from(matchings).orderBy(desc(matchings.id));
  }),
  createMatching: publicQuery.input(z.object({ ...withToken, data: matchingInput })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    const [r] = await getDb().insert(matchings).values(input.data).returning({ id: matchings.id });
    return { id: Number(r.id) };
  }),
  updateMatching: publicQuery.input(z.object({ ...withToken, id: z.number(), data: matchingInput.partial() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().update(matchings).set(input.data).where(eq(matchings.id, input.id));
    return { ok: true };
  }),
  deleteMatching: publicQuery.input(z.object({ ...withToken, id: z.number() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().delete(matchings).where(eq(matchings.id, input.id));
    return { ok: true };
  }),
  /** Suggestions automatiques de matching pour un travailleur */
  suggestMatches: publicQuery.input(z.object({ ...withToken, travailleurId: z.number() })).query(async ({ input }) => {
    requireAdmin(input.token);
    const db = getDb();
    const [t] = await db.select().from(travailleurs).where(eq(travailleurs.id, input.travailleurId)).limit(1);
    if (!t) return [];
    const offres = await db.select().from(offresEmploi).where(eq(offresEmploi.statut, "ouverte"));
    const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    return offres
      .map((o) => {
        let score = 0;
        if (t.filiereId && o.filiereId && Number(t.filiereId) === Number(o.filiereId)) score += 50;
        if (t.metier && o.metier && norm(t.metier) === norm(o.metier)) score += 30;
        else if (t.metier && o.metier && (norm(o.metier).includes(norm(t.metier)) || norm(t.metier).includes(norm(o.metier)))) score += 15;
        if (t.niveauItalien === "avancé" || t.niveauItalien === "courant") score += 10;
        else if (t.niveauItalien === "intermédiaire") score += 5;
        if (t.experienceAnnees >= 2) score += 10;
        return { offre: o, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);
  }),

  // ─── COMPTABILITÉ ──────────────────────────────────────────────────────
  listTransactions: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    return getDb().select().from(transactions).orderBy(desc(transactions.id));
  }),
  createTransaction: publicQuery.input(z.object({ ...withToken, data: transactionInput })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    const data = { ...input.data };
    if (!data.montantLettres || data.montantLettres.trim() === "") {
      const num = parseNumber(data.montantChiffres);
      data.montantLettres = num > 0 ? numberToLetters(num) : "";
    }
    const [r] = await getDb().insert(transactions).values(data).returning({ id: transactions.id });
    return { id: Number(r.id) };
  }),
  updateTransaction: publicQuery
    .input(z.object({ ...withToken, id: z.number(), data: transactionInput.partial() }))
    .mutation(async ({ input }) => {
      requireAdmin(input.token);
      const data = { ...input.data };
      if (data.montantChiffres !== undefined) {
        const num = parseNumber(data.montantChiffres);
        data.montantLettres = num > 0 ? numberToLetters(num) : "";
      }
      await getDb().update(transactions).set(data).where(eq(transactions.id, input.id));
      return { ok: true };
    }),
  deleteTransaction: publicQuery.input(z.object({ ...withToken, id: z.number() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().delete(transactions).where(eq(transactions.id, input.id));
    return { ok: true };
  }),
  /** Bilan comptable */
  bilanCompta: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    const rows = await getDb().select().from(transactions);
    let recettes = 0;
    let depenses = 0;
    for (const r of rows) {
      const n = parseNumber(r.montantChiffres);
      if (r.type === "recette") recettes += n;
      else depenses += n;
    }
    return { recettes, depenses, solde: recettes - depenses, count: rows.length };
  }),

  // ─── SALLES / AMPHITHÉÂTRES ────────────────────────────────────────────
  listSalles: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    return getDb().select().from(salles).orderBy(asc(salles.nom));
  }),
  createSalle: publicQuery.input(z.object({ ...withToken, data: salleInput })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    const [r] = await getDb().insert(salles).values(input.data).returning({ id: salles.id });
    return { id: Number(r.id) };
  }),
  updateSalle: publicQuery.input(z.object({ ...withToken, id: z.number(), data: salleInput.partial() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().update(salles).set(input.data).where(eq(salles.id, input.id));
    return { ok: true };
  }),
  deleteSalle: publicQuery.input(z.object({ ...withToken, id: z.number() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().delete(salles).where(eq(salles.id, input.id));
    return { ok: true };
  }),

  // ─── RÉUSSITES / PLACEMENTS ────────────────────────────────────────────
  listPlacements: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    return getDb().select().from(placements).orderBy(desc(placements.id));
  }),
  createPlacement: publicQuery.input(z.object({ ...withToken, data: placementInput })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    const [r] = await getDb().insert(placements).values(input.data).returning({ id: placements.id });
    return { id: Number(r.id) };
  }),
  updatePlacement: publicQuery
    .input(z.object({ ...withToken, id: z.number(), data: placementInput.partial() }))
    .mutation(async ({ input }) => {
      requireAdmin(input.token);
      await getDb().update(placements).set(input.data).where(eq(placements.id, input.id));
      return { ok: true };
    }),
  deletePlacement: publicQuery.input(z.object({ ...withToken, id: z.number() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().delete(placements).where(eq(placements.id, input.id));
    return { ok: true };
  }),

  // ─── TUTEURS / ENSEIGNANTS ─────────────────────────────────────────────
  listTuteurs: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    return getDb().select().from(tuteurs).orderBy(asc(tuteurs.nom));
  }),
  createTuteur: publicQuery.input(z.object({ ...withToken, data: tuteurInput })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    const [r] = await getDb().insert(tuteurs).values(input.data).returning({ id: tuteurs.id });
    return { id: Number(r.id) };
  }),
  updateTuteur: publicQuery.input(z.object({ ...withToken, id: z.number(), data: tuteurInput.partial() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().update(tuteurs).set(input.data).where(eq(tuteurs.id, input.id));
    return { ok: true };
  }),
  deleteTuteur: publicQuery.input(z.object({ ...withToken, id: z.number() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().delete(tuteurs).where(eq(tuteurs.id, input.id));
    return { ok: true };
  }),

  // ─── PAIEMENTS CANDIDATS ───────────────────────────────────────────────
  listPaiements: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    return getDb().select().from(paiements).orderBy(desc(paiements.id));
  }),
  createPaiement: publicQuery.input(z.object({ ...withToken, data: paiementInput })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    const db = getDb();
    const data = { ...input.data };
    if (!data.montantLettres || data.montantLettres.trim() === "") {
      const num = parseNumber(data.montantChiffres);
      data.montantLettres = num > 0 ? numberToLetters(num) : "";
    }
    const [r] = await db.insert(paiements).values(data).returning({ id: paiements.id });
    // Alimente automatiquement la comptabilité
    const [ins] = await db.select().from(inscriptions).where(eq(inscriptions.id, data.inscriptionId)).limit(1);
    const nomComplet = ins ? `${ins.prenom} ${ins.nom}` : `Inscription #${data.inscriptionId}`;
    await db.insert(transactions).values({
      date: data.date,
      type: "recette",
      categorie: data.nature === "reliquat" ? "Reliquat formation" : "Frais d'inscription",
      libelle: `${data.nature === "reliquat" ? "Reliquat" : "Inscription"} — ${nomComplet}`,
      montantChiffres: data.montantChiffres,
      montantLettres: data.montantLettres,
      modePaiement: data.modePaiement,
      inscriptionId: data.inscriptionId,
      notes: data.reference ? `Réf: ${data.reference}` : "",
    });
    return { id: Number(r.id) };
  }),
  deletePaiement: publicQuery.input(z.object({ ...withToken, id: z.number() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().delete(paiements).where(eq(paiements.id, input.id));
    return { ok: true };
  }),
  /** Situation financière d'un candidat : total payé, reste à payer */
  situationPaiement: publicQuery
    .input(z.object({ ...withToken, inscriptionId: z.number() }))
    .query(async ({ input }) => {
      requireAdmin(input.token);
      const db = getDb();
      const rows = (await db.select().from(paiements)).filter((p) => Number(p.inscriptionId) === input.inscriptionId);
      const paye = rows.reduce((s, p) => s + parseNumber(p.montantChiffres), 0);
      const tarifsRows = await db.select().from(tarifs);
      const total = tarifsRows.filter((t) => t.estTotal).reduce((s, t) => s + parseNumber(t.montantChiffres), 0)
        || tarifsRows.reduce((s, t) => s + parseNumber(t.montantChiffres), 0);
      return { paye, total, reste: Math.max(0, total - paye), paiements: rows };
    }),

  // ─── COMPTABILITÉ PÉRIODIQUE ───────────────────────────────────────────
  comptaPeriode: publicQuery
    .input(z.object({ ...withToken, periode: z.string().default("mois") }))
    .query(async ({ input }) => {
      requireAdmin(input.token);
      const rows = await getDb().select().from(transactions).orderBy(desc(transactions.date));
      const key = (dateStr: string) => {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "autre";
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        if (input.periode === "jour") return dateStr;
        if (input.periode === "semaine") {
          const onejan = new Date(y, 0, 1);
          const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
          return `${y}-S${String(week).padStart(2, "0")}`;
        }
        if (input.periode === "mois") return `${y}-${m}`;
        if (input.periode === "trimestre") return `${y}-T${Math.floor(d.getMonth() / 3) + 1}`;
        return String(y);
      };
      const groups: Record<string, { recettes: number; depenses: number; count: number }> = {};
      for (const r of rows) {
        const k = key(r.date);
        if (!groups[k]) groups[k] = { recettes: 0, depenses: 0, count: 0 };
        const n = parseNumber(r.montantChiffres);
        if (r.type === "recette") groups[k].recettes += n;
        else groups[k].depenses += n;
        groups[k].count++;
      }
      return Object.entries(groups)
        .map(([periode, v]) => ({ periode, ...v, solde: v.recettes - v.depenses }))
        .sort((a, b) => b.periode.localeCompare(a.periode));
    }),

  // ─── PIPELINE CANDIDATS ────────────────────────────────────────────────
  pipelineStats: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    const db = getDb();
    const insc = await db.select().from(inscriptions);
    const trav = await db.select().from(travailleurs);
    const match = await db.select().from(matchings);
    const plac = await db.select().from(placements);
    return {
      inscrits: insc.length,
      payants: insc.filter((i) => i.natureCandidat === "payant").length,
      boursiers: insc.filter((i) => i.natureCandidat === "boursier").length,
      admis: insc.filter((i) => i.statut === "accepté" || i.statut === "admis").length,
      travailleurs: trav.length,
      matchings: match.length,
      matchingsAboutis: match.filter((m) => m.statut === "abouti").length,
      contrats: plac.filter((p) => p.type === "contrat").length,
      reussites: plac.filter((p) => p.type === "reussite").length,
    };
  }),

  // ─── CENTRES DE FORMATION ──────────────────────────────────────────────
  listCentres: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    return getDb().select().from(centres).orderBy(asc(centres.nom));
  }),
  createCentre: publicQuery.input(z.object({ ...withToken, data: centreInput })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    const [r] = await getDb().insert(centres).values(input.data).returning({ id: centres.id });
    return { id: Number(r.id) };
  }),
  updateCentre: publicQuery.input(z.object({ ...withToken, id: z.number(), data: centreInput.partial() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().update(centres).set(input.data).where(eq(centres.id, input.id));
    return { ok: true };
  }),
  deleteCentre: publicQuery.input(z.object({ ...withToken, id: z.number() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().delete(centres).where(eq(centres.id, input.id));
    return { ok: true };
  }),

  // ─── COMPTES ADMIN (rôles) ─────────────────────────────────────────────
  listAdmins: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    const rows = await getDb().select().from(admins);
    return rows.map((a) => ({ id: Number(a.id), username: a.username, role: a.role }));
  }),
  createAdmin: publicQuery
    .input(z.object({ ...withToken, username: z.string().min(3), password: z.string().min(6), role: z.string().default("operateur") }))
    .mutation(async ({ input }) => {
      requireAdmin(input.token);
      const db = getDb();
      const [r] = await db
        .insert(admins)
        .values({ username: input.username, passwordHash: await bcrypt.hash(input.password, 10), role: input.role })
        .returning({ id: admins.id });
      return { id: Number(r.id) };
    }),
  updateAdminRole: publicQuery
    .input(z.object({ ...withToken, id: z.number(), role: z.string() }))
    .mutation(async ({ input }) => {
      requireAdmin(input.token);
      await getDb().update(admins).set({ role: input.role }).where(eq(admins.id, input.id));
      return { ok: true };
    }),
  deleteAdmin: publicQuery.input(z.object({ ...withToken, id: z.number() })).mutation(async ({ input }) => {
    const payload = requireAdmin(input.token);
    if (payload.sub === input.id) throw new TRPCError({ code: "BAD_REQUEST", message: "Impossible de supprimer votre propre compte." });
    await getDb().delete(admins).where(eq(admins.id, input.id));
    return { ok: true };
  }),

  // ─── RAPPORT SYNTHÈSE (Ambassades / Ministères) ────────────────────────
  rapportSynthese: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    const db = getDb();
    const insc = await db.select().from(inscriptions);
    const trav = await db.select().from(travailleurs);
    const plac = await db.select().from(placements);
    const txs = await db.select().from(transactions);
    const sallesRows = await db.select().from(salles);
    const centresRows = await db.select().from(centres);
    const tuteursRows = await db.select().from(tuteurs);
    const fils = await db.select().from(filieres);
    const cyc = await db.select().from(cycles);

    const recettes = txs.filter((t) => t.type === "recette").reduce((s, t) => s + parseNumber(t.montantChiffres), 0);
    const depenses = txs.filter((t) => t.type === "dépense").reduce((s, t) => s + parseNumber(t.montantChiffres), 0);
    const contrats = plac.filter((p) => p.type === "contrat");
    const reussites = plac.filter((p) => p.type === "reussite");

    const parFiliere = fils.map((f) => ({
      filiere: f.titre,
      inscrits: insc.filter((i) => Number(i.filiereId) === Number(f.id)).length,
      contrats: contrats.filter((c) => trav.find((t) => Number(t.id) === Number(c.travailleurId) && Number(t.filiereId) === Number(f.id))).length,
    }));

    return {
      dateEdition: new Date().toISOString().slice(0, 10),
      cycles: cyc.map((c) => ({ nom: c.nom, session: c.sessionLabel, heures: c.dureeHeures, participants: c.nbParticipants })),
      inscrits: insc.length,
      payants: insc.filter((i) => i.natureCandidat === "payant").length,
      boursiers: insc.filter((i) => i.natureCandidat === "boursier").length,
      travailleursFormes: trav.length,
      reussites: reussites.length,
      contratsConclus: contrats.length,
      tauxPlacement: trav.length > 0 ? Math.round((contrats.length / trav.length) * 100) : 0,
      recettes, depenses, solde: recettes - depenses,
      recettesLettres: recettes > 0 ? numberToLetters(recettes) : "",
      soldeLettres: recettes - depenses > 0 ? numberToLetters(recettes - depenses) : "",
      centres: centresRows.length,
      salles: sallesRows.length,
      capaciteTotale: sallesRows.reduce((s, x) => s + x.capacite, 0) + centresRows.reduce((s, x) => s + x.capacite, 0),
      encadrement: tuteursRows.length,
      parFiliere,
      parCentre: centresRows.map((c) => ({
        centre: c.nom, partenaire: c.partenaire, type: c.typePartenaire, ville: c.ville, capacite: c.capacite,
        inscrits: insc.filter((i) => Number(i.centreId) === Number(c.id)).length,
      })),
    };
  }),

  /** Vue entreprise : fiches travailleurs anonymisées enrichies */
  fichesEntreprise: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    const trav = await getDb().select().from(travailleurs).orderBy(desc(travailleurs.id));
    return trav.map((t) => ({
      id: Number(t.id),
      reference: `TR-${String(t.id).padStart(4, "0")}`,
      prenom: t.prenom, nom: t.nom,
      age: t.age, sexe: t.sexe,
      situationFamiliale: t.situationFamiliale,
      qualification: t.qualification,
      profession: t.profession, metier: t.metier,
      competences: t.competences,
      experienceAnnees: t.experienceAnnees,
      niveauItalien: t.niveauItalien, autresLangues: t.autresLangues,
      statut: t.statut,
    }));
  }),

  /** Mise à jour de la nature du candidat (payant / boursier) */
  updateNatureCandidat: publicQuery
    .input(z.object({ ...withToken, id: z.number(), nature: z.string() }))
    .mutation(async ({ input }) => {
      requireAdmin(input.token);
      await getDb().update(inscriptions).set({ natureCandidat: input.nature }).where(eq(inscriptions.id, input.id));
      return { ok: true };
    }),

  /** Disposition de paiement (mensualités / reliquat unique / reliquat au Nulla Osta) */
  setDispositionPaiement: publicQuery
    .input(z.object({ ...withToken, id: z.number(), disposition: z.string() }))
    .mutation(async ({ input }) => {
      requireAdmin(input.token);
      await getDb().update(inscriptions).set({ dispositionPaiement: input.disposition }).where(eq(inscriptions.id, input.id));
      return { ok: true };
    }),

  /** Alerte : candidats payants qui n'ont pas soldé (inscription ou reliquat) */
  alertesNonPayants: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    const db = getDb();
    const insc = await db.select().from(inscriptions);
    const pais = await db.select().from(paiements);
    const tarifsRows = await db.select().from(tarifs);
    const total = tarifsRows.filter((t) => t.estTotal).reduce((s, t) => s + parseNumber(t.montantChiffres), 0)
      || tarifsRows.reduce((s, t) => s + parseNumber(t.montantChiffres), 0);
    const fraisInscription = tarifsRows.filter((t) => !t.estTotal).reduce((s, t) => s + parseNumber(t.montantChiffres), 0) || total;
    return insc
      .filter((i) => i.natureCandidat !== "boursier" && i.statut !== "refusé")
      .map((i) => {
        const paye = pais.filter((p) => Number(p.inscriptionId) === Number(i.id)).reduce((s, p) => s + parseNumber(p.montantChiffres), 0);
        const reste = Math.max(0, (total || 0) - paye);
        const niveau = paye === 0 ? "jamais_payé" : reste > 0 ? "reliquat_dû" : "soldé";
        return {
          id: Number(i.id),
          nom: `${i.prenom} ${i.nom}`,
          telephone: i.telephone,
          statut: i.statut,
          disposition: i.dispositionPaiement,
          paye, reste, niveau,
          attendu: total || fraisInscription,
        };
      })
      .filter((i) => i.niveau !== "soldé");
  }),

  // ─── MODULES DE FORMATION (heures, module après module) ────────────────
  listModules: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    return getDb().select().from(modules).orderBy(asc(modules.ordre), asc(modules.id));
  }),
  createModule: publicQuery.input(z.object({ ...withToken, data: moduleInput })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    const [r] = await getDb().insert(modules).values(input.data).returning({ id: modules.id });
    return { id: Number(r.id) };
  }),
  updateModule: publicQuery.input(z.object({ ...withToken, id: z.number(), data: moduleInput.partial() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().update(modules).set(input.data).where(eq(modules.id, input.id));
    return { ok: true };
  }),
  deleteModule: publicQuery.input(z.object({ ...withToken, id: z.number() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().delete(modules).where(eq(modules.id, input.id));
    return { ok: true };
  }),

  // ─── PROGRESSION DES CANDIDATS DANS LES MODULES ────────────────────────
  listProgressions: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    return getDb().select().from(progressions).orderBy(desc(progressions.id));
  }),
  setProgression: publicQuery
    .input(z.object({ ...withToken, data: progressionInput }))
    .mutation(async ({ input }) => {
      requireAdmin(input.token);
      const db = getDb();
      const d = input.data;
      const exist = (await db.select().from(progressions)).find(
        (p) => Number(p.inscriptionId) === d.inscriptionId && Number(p.moduleId) === d.moduleId,
      );
      const data = { ...d };
      if (data.statut === "validé" && !data.dateValidation) data.dateValidation = new Date().toISOString().slice(0, 10);
      if (exist) {
        await db.update(progressions).set(data).where(eq(progressions.id, exist.id));
        return { id: Number(exist.id) };
      }
      const [r] = await db.insert(progressions).values(data).returning({ id: progressions.id });
      return { id: Number(r.id) };
    }),
  /** Tableau de progression : modules × candidats admis */
  tableauProgression: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    const db = getDb();
    const mods = await db.select().from(modules).orderBy(asc(modules.ordre));
    const insc = (await db.select().from(inscriptions)).filter((i) => ["admis", "payé", "confirmé"].includes(i.statut));
    const progs = await db.select().from(progressions);
    return {
      modules: mods,
      candidats: insc.map((i) => {
        const rows = progs.filter((p) => Number(p.inscriptionId) === Number(i.id));
        const heuresFaites = rows.reduce((s, p) => s + p.heuresFaites, 0);
        const valides = rows.filter((p) => p.statut === "validé").length;
        return {
          id: Number(i.id),
          nom: `${i.prenom} ${i.nom}`,
          filiere: i.filiereLabel,
          heuresFaites,
          modulesValides: valides,
          totalModules: mods.length,
          parModule: rows,
        };
      }),
    };
  }),

  // ─── ÉTAPES VISA (précontrat → Nulla Osta → visa → contrat) ────────────
  listEtapesVisa: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    return getDb().select().from(etapesVisa).orderBy(desc(etapesVisa.id));
  }),
  createEtapeVisa: publicQuery.input(z.object({ ...withToken, data: etapeVisaInput })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    const [r] = await getDb().insert(etapesVisa).values(input.data).returning({ id: etapesVisa.id });
    return { id: Number(r.id) };
  }),
  updateEtapeVisa: publicQuery.input(z.object({ ...withToken, id: z.number(), data: etapeVisaInput.partial() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().update(etapesVisa).set(input.data).where(eq(etapesVisa.id, input.id));
    return { ok: true };
  }),
  deleteEtapeVisa: publicQuery.input(z.object({ ...withToken, id: z.number() })).mutation(async ({ input }) => {
    requireAdmin(input.token);
    await getDb().delete(etapesVisa).where(eq(etapesVisa.id, input.id));
    return { ok: true };
  }),
  /** Taux de réussite : Nulla Osta → visas → contrats */
  statsVisa: publicQuery.input(z.object(withToken)).query(async ({ input }) => {
    requireAdmin(input.token);
    const rows = await getDb().select().from(etapesVisa);
    const precontrats = rows.length;
    const nullaOsta = rows.filter((r) => r.dateNullaOsta).length;
    const visasObtenus = rows.filter((r) => r.resultatVisa === "accordé").length;
    const contrats = rows.filter((r) => r.dateContrat || r.statut === "contrat_signé").length;
    return {
      precontrats, nullaOsta, visasObtenus, contrats,
      tauxNullaOsta: precontrats > 0 ? Math.round((nullaOsta / precontrats) * 100) : 0,
      tauxVisa: nullaOsta > 0 ? Math.round((visasObtenus / nullaOsta) * 100) : 0,
      tauxContratVsNullaOsta: nullaOsta > 0 ? Math.round((contrats / nullaOsta) * 100) : 0,
    };
  }),
});
