CREATE TABLE IF NOT EXISTS "paiements" (
	"id" serial PRIMARY KEY NOT NULL,
	"inscription_id" bigint NOT NULL,
	"date" varchar(30) NOT NULL,
	"nature" varchar(30) DEFAULT 'inscription' NOT NULL,
	"montant_chiffres" varchar(100) NOT NULL,
	"montant_lettres" varchar(255) DEFAULT '' NOT NULL,
	"mode_paiement" varchar(50) DEFAULT 'espèces' NOT NULL,
	"reference" varchar(100) DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "centres" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(255) NOT NULL,
	"partenaire" varchar(255) DEFAULT '' NOT NULL,
	"type_partenaire" varchar(100) DEFAULT 'privé' NOT NULL,
	"adresse" varchar(255) DEFAULT '' NOT NULL,
	"ville" varchar(100) DEFAULT 'Dakar' NOT NULL,
	"capacite" integer DEFAULT 0 NOT NULL,
	"contact" varchar(255) DEFAULT '' NOT NULL,
	"statut" varchar(50) DEFAULT 'actif' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inscriptions" ADD COLUMN IF NOT EXISTS "nature_candidat" varchar(30) DEFAULT 'payant' NOT NULL;
--> statement-breakpoint
ALTER TABLE "inscriptions" ADD COLUMN IF NOT EXISTS "centre_id" bigint;
--> statement-breakpoint
ALTER TABLE "travailleurs" ADD COLUMN IF NOT EXISTS "situation_familiale" varchar(30) DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "travailleurs" ADD COLUMN IF NOT EXISTS "qualification" varchar(100) DEFAULT '' NOT NULL;
