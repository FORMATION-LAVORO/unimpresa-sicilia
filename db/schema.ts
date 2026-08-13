import {
  pgTable,
  serial,
  bigint,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

// ─── Cycles / sessions de formation ─────────────────────────────────────────
export const cycles = pgTable("cycles", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 255 }).notNull(),
  dateDebut: varchar("date_debut", { length: 100 }).notNull(),
  dateFin: varchar("date_fin", { length: 100 }).notNull(),
  sessionLabel: varchar("session_label", { length: 255 }).notNull().default(""),
  dureeHeures: varchar("duree_heures", { length: 50 }).notNull(),
  nbParticipants: integer("nb_participants").notNull(),
  lieu: text("lieu").notNull(),
  ville: varchar("ville", { length: 100 }).notNull().default("Dakar"),
  pays: varchar("pays", { length: 100 }).notNull().default("Sénégal"),
  actif: boolean("actif").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Filières / secteurs ────────────────────────────────────────────────────
export const filieres = pgTable("filieres", {
  id: serial("id").primaryKey(),
  cycleId: bigint("cycle_id", { mode: "number" }),
  titre: varchar("titre", { length: 255 }).notNull(),
  description: text("description").notNull(),
  dureeHeures: varchar("duree_heures", { length: 50 }).notNull(),
  nbMetiers: integer("nb_metiers").notNull(),
  icone: varchar("icone", { length: 50 }).notNull().default("📚"),
  badge: varchar("badge", { length: 100 }).notNull().default(""),
  metiers: text("metiers").notNull().default(""),
  ordre: integer("ordre").notNull().default(0),
  actif: boolean("actif").notNull().default(true),
});

// ─── Tarifs ─────────────────────────────────────────────────────────────────
export const tarifs = pgTable("tarifs", {
  id: serial("id").primaryKey(),
  cycleId: bigint("cycle_id", { mode: "number" }),
  label: varchar("label", { length: 255 }).notNull(),
  montantChiffres: varchar("montant_chiffres", { length: 100 }).notNull(),
  montantLettres: varchar("montant_lettres", { length: 255 }).notNull().default(""),
  description: varchar("description", { length: 255 }).notNull().default(""),
  estTotal: boolean("est_total").notNull().default(false),
  ordre: integer("ordre").notNull().default(0),
});

// ─── Étapes du déroulement (timeline) ───────────────────────────────────────
export const etapes = pgTable("etapes", {
  id: serial("id").primaryKey(),
  cycleId: bigint("cycle_id", { mode: "number" }),
  numero: varchar("numero", { length: 10 }).notNull(),
  icone: varchar("icone", { length: 50 }).notNull().default("📌"),
  titre: varchar("titre", { length: 255 }).notNull(),
  description: text("description").notNull(),
  ordre: integer("ordre").notNull().default(0),
});

// ─── Paramètres globaux (clé / valeur) ──────────────────────────────────────
export const parametres = pgTable("parametres", {
  id: serial("id").primaryKey(),
  cle: varchar("cle", { length: 100 }).notNull().unique(),
  valeur: text("valeur").notNull(),
});

// ─── Admins ─────────────────────────────────────────────────────────────────
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("superadmin"),
});

// ─── Inscriptions candidats (dossier complet) ───────────────────────────────
export const inscriptions = pgTable("inscriptions", {
  id: serial("id").primaryKey(),
  numeroDossier: varchar("numero_dossier", { length: 50 }).notNull().default(""),
  nom: varchar("nom", { length: 100 }).notNull(),
  prenom: varchar("prenom", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  telephone: varchar("telephone", { length: 50 }).notNull(),
  filiereId: bigint("filiere_id", { mode: "number" }),
  filiereLabel: varchar("filiere_label", { length: 255 }).notNull().default(""),
  cycleId: bigint("cycle_id", { mode: "number" }),
  cycleLabel: varchar("cycle_label", { length: 255 }).notNull().default(""),
  statut: varchar("statut", { length: 50 }).notNull().default("nouveau"),
  dateNaissance: varchar("date_naissance", { length: 30 }).notNull().default(""),
  lieuNaissance: varchar("lieu_naissance", { length: 150 }).notNull().default(""),
  sexe: varchar("sexe", { length: 20 }).notNull().default(""),
  situationFamiliale: varchar("situation_familiale", { length: 30 }).notNull().default(""),
  documents: text("documents").notNull().default(""),
  adresse: varchar("adresse", { length: 255 }).notNull().default(""),
  urgenceNom: varchar("urgence_nom", { length: 150 }).notNull().default(""),
  urgenceTelephone: varchar("urgence_telephone", { length: 50 }).notNull().default(""),
  enActivite: varchar("en_activite", { length: 10 }).notNull().default(""),
  profession: varchar("profession", { length: 150 }).notNull().default(""),
  employeur: varchar("employeur", { length: 150 }).notNull().default(""),
  metierChoisi: varchar("metier_choisi", { length: 150 }).notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Partenaires ────────────────────────────────────────────────────────────
export const partenaires = pgTable("partenaires", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 255 }).notNull(),
  description: text("description").notNull().default(""),
  logo: varchar("logo", { length: 500 }).notNull().default(""),
  ordre: integer("ordre").notNull().default(0),
  actif: boolean("actif").notNull().default(true),
});

// ─── Avantages (« Pourquoi nous choisir ») ──────────────────────────────────
export const avantages = pgTable("avantages", {
  id: serial("id").primaryKey(),
  icone: varchar("icone", { length: 50 }).notNull().default("✅"),
  titre: varchar("titre", { length: 255 }).notNull(),
  description: text("description").notNull().default(""),
  ordre: integer("ordre").notNull().default(0),
  actif: boolean("actif").notNull().default(true),
});

// ─── Rendez-vous ────────────────────────────────────────────────────────────
export const rendezVous = pgTable("rendez_vous", {
  id: serial("id").primaryKey(),
  prenom: varchar("prenom", { length: 100 }).notNull(),
  nom: varchar("nom", { length: 100 }).notNull(),
  telephone: varchar("telephone", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().default(""),
  motif: text("motif").notNull().default(""),
  dateSouhaitee: varchar("date_souhaitee", { length: 50 }).notNull().default(""),
  statut: varchar("statut", { length: 50 }).notNull().default("nouveau"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Cycle = typeof cycles.$inferSelect;
export type Filiere = typeof filieres.$inferSelect;
export type Tarif = typeof tarifs.$inferSelect;
export type Etape = typeof etapes.$inferSelect;
export type Parametre = typeof parametres.$inferSelect;
export type Inscription = typeof inscriptions.$inferSelect;
export type Partenaire = typeof partenaires.$inferSelect;
export type Avantage = typeof avantages.$inferSelect;
export type RendezVous = typeof rendezVous.$inferSelect;
