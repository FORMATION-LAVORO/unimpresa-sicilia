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
  natureCandidat: varchar("nature_candidat", { length: 30 }).notNull().default("payant"),
  centreId: bigint("centre_id", { mode: "number" }),
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

// ═══════════════════════════════════════════════════════════════════════════
// MODULES BACK-OFFICE AVANCÉS
// ═══════════════════════════════════════════════════════════════════════════

// ─── Travailleurs (profils professionnels) ─────────────────────────────────
export const travailleurs = pgTable("travailleurs", {
  id: serial("id").primaryKey(),
  inscriptionId: bigint("inscription_id", { mode: "number" }),
  nom: varchar("nom", { length: 100 }).notNull(),
  prenom: varchar("prenom", { length: 100 }).notNull(),
  dateNaissance: varchar("date_naissance", { length: 30 }).notNull().default(""),
  age: integer("age").notNull().default(0),
  sexe: varchar("sexe", { length: 20 }).notNull().default(""),
  situationFamiliale: varchar("situation_familiale", { length: 30 }).notNull().default(""),
  qualification: varchar("qualification", { length: 100 }).notNull().default(""),
  telephone: varchar("telephone", { length: 50 }).notNull().default(""),
  email: varchar("email", { length: 255 }).notNull().default(""),
  profession: varchar("profession", { length: 150 }).notNull().default(""),
  competences: text("competences").notNull().default(""),
  experienceAnnees: integer("experience_annees").notNull().default(0),
  niveauItalien: varchar("niveau_italien", { length: 30 }).notNull().default("débutant"),
  autresLangues: varchar("autres_langues", { length: 255 }).notNull().default(""),
  filiereId: bigint("filiere_id", { mode: "number" }),
  metier: varchar("metier", { length: 150 }).notNull().default(""),
  statut: varchar("statut", { length: 50 }).notNull().default("en_formation"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Offres d'emploi en Italie ──────────────────────────────────────────────
export const offresEmploi = pgTable("offres_emploi", {
  id: serial("id").primaryKey(),
  titre: varchar("titre", { length: 255 }).notNull(),
  entreprise: varchar("entreprise", { length: 255 }).notNull().default(""),
  ville: varchar("ville", { length: 100 }).notNull().default(""),
  filiereId: bigint("filiere_id", { mode: "number" }),
  metier: varchar("metier", { length: 150 }).notNull().default(""),
  typeContrat: varchar("type_contrat", { length: 100 }).notNull().default(""),
  salaire: varchar("salaire", { length: 100 }).notNull().default(""),
  description: text("description").notNull().default(""),
  statut: varchar("statut", { length: 50 }).notNull().default("ouverte"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Matching travailleurs ↔ offres / filières ─────────────────────────────
export const matchings = pgTable("matchings", {
  id: serial("id").primaryKey(),
  travailleurId: bigint("travailleur_id", { mode: "number" }).notNull(),
  offreId: bigint("offre_id", { mode: "number" }),
  filiereId: bigint("filiere_id", { mode: "number" }),
  type: varchar("type", { length: 30 }).notNull().default("emploi"),
  score: integer("score").notNull().default(0),
  statut: varchar("statut", { length: 50 }).notNull().default("proposé"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Comptabilité (recettes / dépenses) ────────────────────────────────────
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  date: varchar("date", { length: 30 }).notNull(),
  type: varchar("type", { length: 20 }).notNull().default("recette"),
  categorie: varchar("categorie", { length: 100 }).notNull().default(""),
  libelle: varchar("libelle", { length: 255 }).notNull(),
  montantChiffres: varchar("montant_chiffres", { length: 100 }).notNull(),
  montantLettres: varchar("montant_lettres", { length: 255 }).notNull().default(""),
  modePaiement: varchar("mode_paiement", { length: 50 }).notNull().default("espèces"),
  inscriptionId: bigint("inscription_id", { mode: "number" }),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Salles de classe et amphithéâtres ─────────────────────────────────────
export const salles = pgTable("salles", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 255 }).notNull(),
  type: varchar("type", { length: 30 }).notNull().default("salle"),
  capacite: integer("capacite").notNull().default(30),
  occupation: integer("occupation").notNull().default(0),
  equipements: text("equipements").notNull().default(""),
  localisation: varchar("localisation", { length: 255 }).notNull().default(""),
  seuilAlerte: integer("seuil_alerte").notNull().default(90),
  actif: boolean("actif").notNull().default(true),
});

// ─── Réussites et placements en contrats ───────────────────────────────────
export const placements = pgTable("placements", {
  id: serial("id").primaryKey(),
  travailleurId: bigint("travailleur_id", { mode: "number" }),
  inscriptionId: bigint("inscription_id", { mode: "number" }),
  nomComplet: varchar("nom_complet", { length: 255 }).notNull().default(""),
  type: varchar("type", { length: 30 }).notNull().default("reussite"),
  entreprise: varchar("entreprise", { length: 255 }).notNull().default(""),
  poste: varchar("poste", { length: 255 }).notNull().default(""),
  ville: varchar("ville", { length: 100 }).notNull().default(""),
  typeContrat: varchar("type_contrat", { length: 100 }).notNull().default(""),
  dateEvenement: varchar("date_evenement", { length: 30 }).notNull().default(""),
  salaire: varchar("salaire", { length: 100 }).notNull().default(""),
  statut: varchar("statut", { length: 50 }).notNull().default("en_cours"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Tuteurs et enseignants ────────────────────────────────────────────────
export const tuteurs = pgTable("tuteurs", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 100 }).notNull(),
  prenom: varchar("prenom", { length: 100 }).notNull(),
  role: varchar("role", { length: 30 }).notNull().default("enseignant"),
  specialite: varchar("specialite", { length: 255 }).notNull().default(""),
  filiereId: bigint("filiere_id", { mode: "number" }),
  telephone: varchar("telephone", { length: 50 }).notNull().default(""),
  email: varchar("email", { length: 255 }).notNull().default(""),
  langues: varchar("langues", { length: 255 }).notNull().default(""),
  statut: varchar("statut", { length: 50 }).notNull().default("actif"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Travailleur = typeof travailleurs.$inferSelect;
export type OffreEmploi = typeof offresEmploi.$inferSelect;
export type Matching = typeof matchings.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Salle = typeof salles.$inferSelect;
export type Placement = typeof placements.$inferSelect;
export type Tuteur = typeof tuteurs.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// BACK-OFFICE V2 — paiements, centres, rôles, pipeline
// ═══════════════════════════════════════════════════════════════════════════

// ─── Paiements des candidats (inscription / reliquat) ──────────────────────
export const paiements = pgTable("paiements", {
  id: serial("id").primaryKey(),
  inscriptionId: bigint("inscription_id", { mode: "number" }).notNull(),
  date: varchar("date", { length: 30 }).notNull(),
  nature: varchar("nature", { length: 30 }).notNull().default("inscription"),
  montantChiffres: varchar("montant_chiffres", { length: 100 }).notNull(),
  montantLettres: varchar("montant_lettres", { length: 255 }).notNull().default(""),
  modePaiement: varchar("mode_paiement", { length: 50 }).notNull().default("espèces"),
  reference: varchar("reference", { length: 100 }).notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Centres de formation ───────────────────────────────────────────────────
export const centres = pgTable("centres", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 255 }).notNull(),
  partenaire: varchar("partenaire", { length: 255 }).notNull().default(""),
  typePartenaire: varchar("type_partenaire", { length: 100 }).notNull().default("privé"),
  adresse: varchar("adresse", { length: 255 }).notNull().default(""),
  ville: varchar("ville", { length: 100 }).notNull().default("Dakar"),
  capacite: integer("capacite").notNull().default(0),
  contact: varchar("contact", { length: 255 }).notNull().default(""),
  statut: varchar("statut", { length: 50 }).notNull().default("actif"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Paiement = typeof paiements.$inferSelect;
export type Centre = typeof centres.$inferSelect;
