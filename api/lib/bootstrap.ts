import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "../queries/connection";
import * as s from "../../db/schema";

/**
 * Bootstrap idempotent : applique les migrations SQL (fichiers db/migrations/*.sql
 * bundlés via import texte) puis insère les données par défaut si les tables
 * sont vides. Appelé UNE fois via POST /api/bootstrap (protégé par JWT_SECRET).
 */
export async function bootstrapDatabase(): Promise<{ ok: boolean; steps: string[] }> {
  const steps: string[] = [];
  const db = getDb();

  // ── 1. Migrations SQL ──────────────────────────────────────────────────────
  const dir = join(process.cwd(), "db", "migrations");
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  for (const f of files) {
    const sqlText = readFileSync(join(dir, f), "utf8");
    const statements = sqlText
      .split("--> statement-breakpoint")
      .map((x) => x.trim())
      .filter(Boolean);
    for (const st of statements) {
      try {
        await (db as any).execute(st);
      } catch (e: any) {
        // idempotent : ignore "already exists"
        if (!/already exists|duplicate/i.test(String(e?.message))) throw e;
      }
    }
    steps.push(`migration ${f}`);
  }

  // ── 2. Seed : compte admin ─────────────────────────────────────────────────
  const admins = await db.select().from(s.admins);
  if (admins.length === 0) {
    const hash = await bcrypt.hash("admin123", 10);
    await db.insert(s.admins).values({ username: "admin", passwordHash: hash, role: "superadmin" });
    steps.push("admin créé");
  }

  // ── 3. Seed : cycle + filières + tarifs + étapes ──────────────────────────
  let cycles = await db.select().from(s.cycles);
  let cycleId: number;
  if (cycles.length === 0) {
    const [c] = await db.insert(s.cycles).values({
      nom: "Cycle 2026",
      dateDebut: "01/09/2026",
      dateFin: "30/11/2026",
      sessionLabel: "Du 01/09 au 30/11/2026 (3 mois)",
      dureeHeures: "120",
      nbParticipants: 500,
      lieu: "Centre Principal — Immeuble ISEG, Faculté de Droit, Dakar",
      ville: "Dakar",
      pays: "Sénégal",
      actif: true,
    }).returning({ id: s.cycles.id });
    cycleId = Number(c.id);
    steps.push("cycle 2026");
  } else {
    cycleId = Number(cycles[0].id);
  }

  const filieres = await db.select().from(s.filieres);
  if (filieres.length === 0) {
    const defs = [
      { icone: "🔌", titre: "Électricien", description: "Installation et maintenance des systèmes électriques résidentiels et industriels.", duree: "3 mois", metiers: ["Électricien bâtiment", "Électricien industriel", "Installateur de panneaux solaires", "Technicien en câblage réseau"] },
      { icone: "🔧", titre: "Plombier", description: "Installation et réparation des systèmes de plomberie et de chauffage.", duree: "3 mois", metiers: ["Plombier sanitaire", "Installateur thermique", "Chauffagiste", "Technicien CVC"] },
      { icone: "🪚", titre: "Menuisier", description: "Travail du bois : meubles, agencements et structures.", duree: "3 mois", metiers: ["Menuisier agenceur", "Ébéniste", "Charpentier bois", "Poseur de parquet"] },
      { icone: "🏗️", titre: "Maçon", description: "Construction, rénovation et gros œuvre du bâtiment.", duree: "3 mois", metiers: ["Maçon", "Carreleur", "Plâtrier-plaquiste", "Façadier"] },
      { icone: "🍳", titre: "Cuisinier", description: "Arts culinaires, restauration collective et gastronomie.", duree: "3 mois", metiers: ["Cuisinier", "Commis de cuisine", "Pizzaiolo", "Chef de partie"] },
      { icone: "👩‍⚕️", titre: "Aide-soignant", description: "Accompagnement et soins aux personnes âgées et dépendantes.", duree: "3 mois", metiers: ["Aide-soignant à domicile", "Auxiliaire de vie", "Accompagnant éducatif", "Assistant en gériatrie"] },
    ];
    for (let i = 0; i < defs.length; i++) {
      await db.insert(s.filieres).values({
        cycleId,
        icone: defs[i].icone,
        titre: defs[i].titre,
        description: defs[i].description,
        dureeHeures: defs[i].duree,
        nbMetiers: defs[i].metiers.length,
        metiers: JSON.stringify(defs[i].metiers),
        badge: "Certification UNIMPRESA",
        ordre: i + 1,
        actif: true,
      });
    }
    steps.push("6 filières");
  }

  const tarifs = await db.select().from(s.tarifs);
  if (tarifs.length === 0) {
    const defs = [
      { label: "Frais d'inscription", montantChiffres: "25 000", montantLettres: "Vingt-cinq mille", ordre: 1 },
      { label: "Frais de formation (par filière)", montantChiffres: "150 000", montantLettres: "Cent cinquante mille", ordre: 2 },
      { label: "Total à payer", montantChiffres: "175 000", montantLettres: "Cent soixante-quinze mille", estTotal: true, ordre: 3 },
    ];
    for (const t of defs) await db.insert(s.tarifs).values({ cycleId, ...t });
    steps.push("3 tarifs");
  }

  const etapes = await db.select().from(s.etapes);
  if (etapes.length === 0) {
    const defs = [
      { titre: "Inscription en ligne", description: "Remplissez le formulaire de candidature en ligne et recevez votre numéro de dossier." },
      { titre: "Validation du dossier", description: "Notre équipe étudie votre dossier et vous contacte sous 72 heures." },
      { titre: "Formation à Dakar", description: "3 mois de formation intensive (120h) au centre principal de Dakar." },
      { titre: "Certification & insertion", description: "Obtention de la certification UNIMPRESA et accompagnement vers l'emploi en Italie." },
    ];
    for (let i = 0; i < defs.length; i++) {
      await db.insert(s.etapes).values({ cycleId, ...defs[i], numero: String(i + 1), ordre: i + 1 });
    }
    steps.push("4 étapes");
  }

  // ── 4. Seed : paramètres globaux ──────────────────────────────────────────
  const params = await db.select().from(s.parametres);
  if (params.length === 0) {
    const defs: Record<string, string> = {
      hero_titre: "Formations professionnelles certifiantes",
      hero_sous_titre: "UNIMPRESA Sicilia — Du Sénégal vers l'Italie : formez-vous aux métiers qui recrutent et obtenez une certification reconnue.",
      hero_badge: "Cycle 2026 — Inscriptions ouvertes",
      infos_titre: "Informations essentielles",
      contact_email: "contact@unimpresa-sicilia.org",
      contact_telephone: "+221 33 800 00 00",
      contact_whatsapp: "+221 77 000 00 00",
      contact_adresse: "Immeuble ISEG, Faculté de Droit, Dakar, Sénégal",
      footer_texte: "UNIMPRESA Sicilia — Programme de formation professionnelle certifiant. Dakar, Sénégal.",
      couleur_principale: "#1B4F72",
      couleur_accent: "#E6AF2E",
      devise: "FCFA",
      logo_url: "",
      email_admin: "contact@unimpresa-sicilia.org",
      paiement_info: "Le paiement peut s'effectuer en plusieurs tranches. Un reliquat est payable après le début de la formation.",
      pourquoi_titre: "Pourquoi choisir UNIMPRESA Sicilia ?",
    };
    for (const [cle, valeur] of Object.entries(defs)) {
      await db.insert(s.parametres).values({ cle, valeur });
    }
    steps.push(`${Object.keys(defs).length} paramètres`);
  }

  // ── 5. Seed : partenaires + avantages ─────────────────────────────────────
  const partenaires = await db.select().from(s.partenaires);
  if (partenaires.length === 0) {
    const defs = [
      { nom: "UNIMPRESA Sicilia", description: "Union des entreprises de Sicile — organisme certificateur" },
      { nom: "ISEG Dakar", description: "Institut Supérieur d'Enseignement Professionnel — centre partenaire" },
      { nom: "Région Sicile", description: "Partenaire institutionnel pour l'insertion professionnelle en Italie" },
      { nom: "Ministère de la Formation Professionnelle", description: "Soutien institutionnel du programme au Sénégal" },
    ];
    for (let i = 0; i < defs.length; i++) {
      await db.insert(s.partenaires).values({ ...defs[i], logo: "", ordre: i + 1, actif: true });
    }
    steps.push("4 partenaires");
  }

  const avantages = await db.select().from(s.avantages);
  if (avantages.length === 0) {
    const defs = [
      { icone: "🎓", titre: "Certification reconnue", description: "Certificat UNIMPRESA reconnu par les employeurs italiens." },
      { icone: "🇮🇹", titre: "Insertion en Italie", description: "Accompagnement vers un emploi qualifié en Sicile après la formation." },
      { icone: "👷", titre: "Formateurs experts", description: "Des professionnels du terrain pour une formation 100 % pratique." },
      { icone: "📋", titre: "Suivi personnalisé", description: "Chaque candidat bénéficie d'un accompagnement de l'inscription à l'emploi." },
      { icone: "💶", titre: "Paiement flexible", description: "Possibilité de payer en plusieurs tranches pendant la formation." },
    ];
    for (let i = 0; i < defs.length; i++) {
      await db.insert(s.avantages).values({ ...defs[i], ordre: i + 1, actif: true });
    }
    steps.push("5 avantages");
  }

  return { ok: true, steps };
}
