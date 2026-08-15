import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import bcrypt from "bcryptjs";
import { sql, eq } from "drizzle-orm";
import pg from "pg";
import { env } from "./env";
import { getDb } from "../queries/connection";
import * as s from "../../db/schema";

export async function bootstrapDatabase(): Promise<{ ok: boolean; steps: string[]; error?: string }> {
  const steps: string[] = [];
  try {
    const db = getDb();

    // ── 1. Migrations SQL ──────────────────────────────────────────────────────
    const dir = join(process.cwd(), "db", "migrations");
    const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
    console.log(`[bootstrap] ${files.length} fichiers de migration trouvés`);

    for (const f of files) {
      const sqlText = readFileSync(join(dir, f), "utf8");
      const statements = sqlText.split("--> statement-breakpoint").map((x) => x.trim()).filter(Boolean);
      console.log(`[bootstrap] ${f}: ${statements.length} statements`);

      const client = new pg.Client({ connectionString: env.databaseUrl });
      await client.connect();
      try {
        for (let i = 0; i < statements.length; i++) {
          const st = statements[i];
          try {
            await client.query(st);
            console.log(`[bootstrap] ${f} [${i + 1}/${statements.length}] OK`);
          } catch (e: any) {
            const msg = String(e?.message ?? e);
            if (/already exists|duplicate|relation .* existe/i.test(msg)) {
              console.log(`[bootstrap] ${f} [${i + 1}/${statements.length}] SKIP (existe déjà)`);
            } else {
              console.error(`[bootstrap] ${f} [${i + 1}/${statements.length}] ERREUR:`, msg);
              throw new Error(`Migration ${f} statement ${i + 1}: ${msg}`);
            }
          }
        }
      } finally {
        await client.end();
      }
      steps.push(`migration ${f}`);
    }

    // ── 2. Seed : compte admin ─────────────────────────────────────────────────
    const admins = await db.select().from(s.admins);
    if (admins.length === 0) {
      const hash = await bcrypt.hash("admin123", 10);
      await db.insert(s.admins).values({ username: "admin", passwordHash: hash, role: "superadmin" });
      steps.push("admin créé");
    } else {
      steps.push("admin existe déjà");
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
      steps.push("cycle existe déjà");
    }

    const filieres = await db.select().from(s.filieres);
    if (filieres.length === 0) {
      const defs = [
        { icone: "🌾", titre: "Agroalimentaire", description: "Ouvrier agricole, tractoriste, boulanger, boucher, opérateur fromager. Formez-vous aux métiers de la terre et de l'alimentation en Italie.", dureeHeures: "120h", metiers: ["Ouvrier agricole maraîcher", "Ouvrier agricole serres et cultures sous abri", "Tractoriste / Conducteur d'engins agricoles", "Ouvrier élevage bovins/volailles/porcs", "Ouvrier pisciculture", "Boulanger", "Boucher", "Opérateur fromager"] },
        { icone: "🏗️", titre: "Bâtiment / Construction", description: "Maçon, ferrailleur, coffreur, électricien, plombier, peintre. Les métiers du BTP sont très demandés en Italie.", dureeHeures: "120h", metiers: ["Maçon", "Ferrailleur", "Coffreur/Bancheur", "Poseur de carrelage et dallage", "Plâtrier/Plaquiste", "Électricien bâtiment", "Plombier/Installateur sanitaire", "Peintre en bâtiment", "Manœuvre spécialisé"] },
        { icone: "🍕", titre: "Restauration", description: "Pizzaiolo, cuisinier, serveur, barman, pâtissier, réceptionniste. Le tourisme italien recrute tout au long de l'année.", dureeHeures: "120h", metiers: ["Pizzaiolo", "Cuisinier", "Serveur/Serveuse de salle", "Barman", "Pâtissier", "Employé housekeeping/hôtel", "Réceptionniste"] },
        { icone: "🚛", titre: "Logistique / Transport", description: "Chauffeur poids lourd, cariste, magasinier, manutentionnaire. La logistique est un pilier de l'économie italienne.", dureeHeures: "120h", metiers: ["Chauffeur poids lourd CQC", "Cariste/Manutentionnaire chariot élévateur", "Magasinier/Préparateur de commandes", "Manutentionnaire/Facchinaggio"] },
        { icone: "⚙️", titre: "Métallurgie", description: "Soudeur, tourneur/fraiseur, mécanicien, monteur-assembleur. L'industrie métallurgique italienne offre de nombreux débouchés.", dureeHeures: "120h", metiers: ["Soudeur", "Tourneur/Fraiseur", "Mécanicien auto/industriel", "Monteur-assembleur mécanique", "Chaudronnier", "Technicien maintenance industrielle"] },
        { icone: "🛒", titre: "Autres secteurs moyens", description: "Employé de rayon, caissier, aide familiale, auxiliaire de vie. Des métiers accessibles et demandés.", dureeHeures: "120h", metiers: ["Employé de rayon/Scaffaliste", "Caissier", "Aide familiale/Badante", "Auxiliaire de vie", "Autres"] },
      ];
      for (let i = 0; i < defs.length; i++) {
        await db.insert(s.filieres).values({
          cycleId,
          icone: defs[i].icone,
          titre: defs[i].titre,
          description: defs[i].description,
          dureeHeures: defs[i].dureeHeures,
          nbMetiers: defs[i].metiers.length,
          metiers: JSON.stringify(defs[i].metiers),
          badge: "Certification UNIMPRESA",
          ordre: i + 1,
          actif: true,
        });
      }
      steps.push("6 filières");
    } else {
      steps.push("filières existent déjà");
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
    } else {
      steps.push("tarifs existent déjà");
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
    } else {
      steps.push("étapes existent déjà");
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
        cout_total: "560000",
        tranche_1: "220000",
        tranche_2: "170000",
        tranche_3: "170000",
        pourquoi_titre: "Pourquoi choisir UNIMPRESA Sicilia ?",
      };
      for (const [cle, valeur] of Object.entries(defs)) {
        await db.insert(s.parametres).values({ cle, valeur });
      }
      steps.push(`${Object.keys(defs).length} paramètres`);
    } else {
      steps.push("paramètres existent déjà");
    }

    // Complète les paramètres manquants (ajouts ultérieurs)
    const defsNew: Record<string, string> = { cout_total: "560000", tranche_1: "220000", tranche_2: "170000", tranche_3: "170000" };
    for (const [cle, valeur] of Object.entries(defsNew)) {
      const [existe] = await db.select().from(s.parametres).where(eq(s.parametres.cle, cle)).limit(1);
      if (!existe) await db.insert(s.parametres).values({ cle, valeur });
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
    } else {
      steps.push("partenaires existent déjà");
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
    } else {
      steps.push("avantages existent déjà");
    }

    console.log("[bootstrap] TERMINÉ:", steps.join(", "));
    return { ok: true, steps };
  } catch (e: any) {
    console.error("[bootstrap] ERREUR FATALE:", e?.message ?? e);
    return { ok: false, steps, error: String(e?.message ?? e) };
  }
}
