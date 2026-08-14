CREATE TABLE IF NOT EXISTS "travailleurs" (
	"id" serial PRIMARY KEY NOT NULL,
	"inscription_id" bigint,
	"nom" varchar(100) NOT NULL,
	"prenom" varchar(100) NOT NULL,
	"date_naissance" varchar(30) DEFAULT '' NOT NULL,
	"age" integer DEFAULT 0 NOT NULL,
	"sexe" varchar(20) DEFAULT '' NOT NULL,
	"telephone" varchar(50) DEFAULT '' NOT NULL,
	"email" varchar(255) DEFAULT '' NOT NULL,
	"profession" varchar(150) DEFAULT '' NOT NULL,
	"competences" text DEFAULT '' NOT NULL,
	"experience_annees" integer DEFAULT 0 NOT NULL,
	"niveau_italien" varchar(30) DEFAULT 'débutant' NOT NULL,
	"autres_langues" varchar(255) DEFAULT '' NOT NULL,
	"filiere_id" bigint,
	"metier" varchar(150) DEFAULT '' NOT NULL,
	"statut" varchar(50) DEFAULT 'en_formation' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "offres_emploi" (
	"id" serial PRIMARY KEY NOT NULL,
	"titre" varchar(255) NOT NULL,
	"entreprise" varchar(255) DEFAULT '' NOT NULL,
	"ville" varchar(100) DEFAULT '' NOT NULL,
	"filiere_id" bigint,
	"metier" varchar(150) DEFAULT '' NOT NULL,
	"type_contrat" varchar(100) DEFAULT '' NOT NULL,
	"salaire" varchar(100) DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"statut" varchar(50) DEFAULT 'ouverte' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "matchings" (
	"id" serial PRIMARY KEY NOT NULL,
	"travailleur_id" bigint NOT NULL,
	"offre_id" bigint,
	"filiere_id" bigint,
	"type" varchar(30) DEFAULT 'emploi' NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"statut" varchar(50) DEFAULT 'proposé' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" varchar(30) NOT NULL,
	"type" varchar(20) DEFAULT 'recette' NOT NULL,
	"categorie" varchar(100) DEFAULT '' NOT NULL,
	"libelle" varchar(255) NOT NULL,
	"montant_chiffres" varchar(100) NOT NULL,
	"montant_lettres" varchar(255) DEFAULT '' NOT NULL,
	"mode_paiement" varchar(50) DEFAULT 'espèces' NOT NULL,
	"inscription_id" bigint,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "salles" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(255) NOT NULL,
	"type" varchar(30) DEFAULT 'salle' NOT NULL,
	"capacite" integer DEFAULT 30 NOT NULL,
	"occupation" integer DEFAULT 0 NOT NULL,
	"equipements" text DEFAULT '' NOT NULL,
	"localisation" varchar(255) DEFAULT '' NOT NULL,
	"seuil_alerte" integer DEFAULT 90 NOT NULL,
	"actif" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "placements" (
	"id" serial PRIMARY KEY NOT NULL,
	"travailleur_id" bigint,
	"inscription_id" bigint,
	"nom_complet" varchar(255) DEFAULT '' NOT NULL,
	"type" varchar(30) DEFAULT 'reussite' NOT NULL,
	"entreprise" varchar(255) DEFAULT '' NOT NULL,
	"poste" varchar(255) DEFAULT '' NOT NULL,
	"ville" varchar(100) DEFAULT '' NOT NULL,
	"type_contrat" varchar(100) DEFAULT '' NOT NULL,
	"date_evenement" varchar(30) DEFAULT '' NOT NULL,
	"salaire" varchar(100) DEFAULT '' NOT NULL,
	"statut" varchar(50) DEFAULT 'en_cours' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tuteurs" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(100) NOT NULL,
	"prenom" varchar(100) NOT NULL,
	"role" varchar(30) DEFAULT 'enseignant' NOT NULL,
	"specialite" varchar(255) DEFAULT '' NOT NULL,
	"filiere_id" bigint,
	"telephone" varchar(50) DEFAULT '' NOT NULL,
	"email" varchar(255) DEFAULT '' NOT NULL,
	"langues" varchar(255) DEFAULT '' NOT NULL,
	"statut" varchar(50) DEFAULT 'actif' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
