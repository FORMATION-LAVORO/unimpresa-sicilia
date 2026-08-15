ALTER TABLE "inscriptions" ADD COLUMN IF NOT EXISTS "salle_id" bigint;
--> statement-breakpoint
ALTER TABLE "inscriptions" ADD COLUMN IF NOT EXISTS "resultat_test" varchar(30) DEFAULT '' NOT NULL;
