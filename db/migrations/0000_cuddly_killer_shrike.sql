CREATE TABLE "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'superadmin' NOT NULL,
	CONSTRAINT "admins_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "avantages" (
	"id" serial PRIMARY KEY NOT NULL,
	"icone" varchar(50) DEFAULT '✅' NOT NULL,
	"titre" varchar(255) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"ordre" integer DEFAULT 0 NOT NULL,
	"actif" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cycles" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(255) NOT NULL,
	"date_debut" varchar(100) NOT NULL,
	"date_fin" varchar(100) NOT NULL,
	"session_label" varchar(255) DEFAULT '' NOT NULL,
	"duree_heures" varchar(50) NOT NULL,
	"nb_participants" integer NOT NULL,
	"lieu" text NOT NULL,
	"ville" varchar(100) DEFAULT 'Dakar' NOT NULL,
	"pays" varchar(100) DEFAULT 'Sénégal' NOT NULL,
	"actif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "etapes" (
	"id" serial PRIMARY KEY NOT NULL,
	"cycle_id" bigint,
	"numero" varchar(10) NOT NULL,
	"icone" varchar(50) DEFAULT '📌' NOT NULL,
	"titre" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"ordre" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "filieres" (
	"id" serial PRIMARY KEY NOT NULL,
	"cycle_id" bigint,
	"titre" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"duree_heures" varchar(50) NOT NULL,
	"nb_metiers" integer NOT NULL,
	"icone" varchar(50) DEFAULT '📚' NOT NULL,
	"badge" varchar(100) DEFAULT '' NOT NULL,
	"metiers" text DEFAULT '' NOT NULL,
	"ordre" integer DEFAULT 0 NOT NULL,
	"actif" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"numero_dossier" varchar(50) DEFAULT '' NOT NULL,
	"nom" varchar(100) NOT NULL,
	"prenom" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"telephone" varchar(50) NOT NULL,
	"filiere_id" bigint,
	"filiere_label" varchar(255) DEFAULT '' NOT NULL,
	"cycle_id" bigint,
	"cycle_label" varchar(255) DEFAULT '' NOT NULL,
	"statut" varchar(50) DEFAULT 'nouveau' NOT NULL,
	"date_naissance" varchar(30) DEFAULT '' NOT NULL,
	"lieu_naissance" varchar(150) DEFAULT '' NOT NULL,
	"sexe" varchar(20) DEFAULT '' NOT NULL,
	"situation_familiale" varchar(30) DEFAULT '' NOT NULL,
	"documents" text DEFAULT '' NOT NULL,
	"adresse" varchar(255) DEFAULT '' NOT NULL,
	"urgence_nom" varchar(150) DEFAULT '' NOT NULL,
	"urgence_telephone" varchar(50) DEFAULT '' NOT NULL,
	"en_activite" varchar(10) DEFAULT '' NOT NULL,
	"profession" varchar(150) DEFAULT '' NOT NULL,
	"employeur" varchar(150) DEFAULT '' NOT NULL,
	"metier_choisi" varchar(150) DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parametres" (
	"id" serial PRIMARY KEY NOT NULL,
	"cle" varchar(100) NOT NULL,
	"valeur" text NOT NULL,
	CONSTRAINT "parametres_cle_unique" UNIQUE("cle")
);
--> statement-breakpoint
CREATE TABLE "partenaires" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(255) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"logo" varchar(500) DEFAULT '' NOT NULL,
	"ordre" integer DEFAULT 0 NOT NULL,
	"actif" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rendez_vous" (
	"id" serial PRIMARY KEY NOT NULL,
	"prenom" varchar(100) NOT NULL,
	"nom" varchar(100) NOT NULL,
	"telephone" varchar(50) NOT NULL,
	"email" varchar(255) DEFAULT '' NOT NULL,
	"motif" text DEFAULT '' NOT NULL,
	"date_souhaitee" varchar(50) DEFAULT '' NOT NULL,
	"statut" varchar(50) DEFAULT 'nouveau' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"cycle_id" bigint,
	"label" varchar(255) NOT NULL,
	"montant_chiffres" varchar(100) NOT NULL,
	"montant_lettres" varchar(255) DEFAULT '' NOT NULL,
	"description" varchar(255) DEFAULT '' NOT NULL,
	"est_total" boolean DEFAULT false NOT NULL,
	"ordre" integer DEFAULT 0 NOT NULL
);
