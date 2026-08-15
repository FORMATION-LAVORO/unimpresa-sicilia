ALTER TABLE "inscriptions" ADD COLUMN IF NOT EXISTS "disposition_paiement" varchar(60) DEFAULT 'mensualités' NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"cycle_id" bigint,
	"filiere_id" bigint,
	"titre" varchar(255) NOT NULL,
	"duree_heures" integer DEFAULT 0 NOT NULL,
	"ordre" integer DEFAULT 0 NOT NULL,
	"actif" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "progressions" (
	"id" serial PRIMARY KEY NOT NULL,
	"inscription_id" bigint NOT NULL,
	"module_id" bigint NOT NULL,
	"heures_faites" integer DEFAULT 0 NOT NULL,
	"statut" varchar(30) DEFAULT 'en_cours' NOT NULL,
	"date_validation" varchar(30) DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "etapes_visa" (
	"id" serial PRIMARY KEY NOT NULL,
	"inscription_id" bigint NOT NULL,
	"travailleur_id" bigint,
	"entreprise" varchar(255) DEFAULT '' NOT NULL,
	"poste" varchar(255) DEFAULT '' NOT NULL,
	"localite" varchar(255) DEFAULT '' NOT NULL,
	"salaire" varchar(100) DEFAULT '' NOT NULL,
	"type_contrat" varchar(100) DEFAULT '' NOT NULL,
	"date_precontrat" varchar(30) DEFAULT '' NOT NULL,
	"date_nulla_osta" varchar(30) DEFAULT '' NOT NULL,
	"date_depot_visa" varchar(30) DEFAULT '' NOT NULL,
	"resultat_visa" varchar(30) DEFAULT '' NOT NULL,
	"date_contrat" varchar(30) DEFAULT '' NOT NULL,
	"statut" varchar(50) DEFAULT 'precontrat' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
