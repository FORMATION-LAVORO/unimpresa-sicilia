import bcrypt from "bcryptjs";
import { eq as eq2 } from "drizzle-orm";
import { getDb } from "../api/queries/connection";
import {
  cycles,
  filieres,
  tarifs,
  etapes,
  parametres,
  admins,
} from "./schema";

/**
 * Seed : valeurs par défaut issues des captures du site.
 * N'écrase rien — n'insère que dans les tables vides.
 */
async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // ─── Cycle par défaut ────────────────────────────────────────────────────
  const existingCycles = await db.select().from(cycles);
  let cycleId: number | null = null;
  if (existingCycles.length === 0) {
    const r = await db.insert(cycles).values({
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
    }).returning({ id: cycles.id });
    cycleId = Number(r[0].id);
    console.log("Cycle 2026 créé.");
  } else {
    cycleId = Number(existingCycles[0].id);
  }

  // ─── Filières ────────────────────────────────────────────────────────────
  if ((await db.select().from(filieres)).length === 0) {
    await db.insert(filieres).values([
      {
        cycleId, titre: "Agroalimentaire",
        description: "Ouvrier agricole, tractoriste, boulanger, boucher, opérateur fromager. Formez-vous aux métiers de la terre et de l'alimentation en Italie.",
        dureeHeures: "120h", nbMetiers: 8, icone: "🌾", badge: "", ordre: 1, actif: true,
      },
      {
        cycleId, titre: "Bâtiment / Construction",
        description: "Maçon, ferrailleur, coffreur, électricien, plombier, peintre. Les métiers du BTP sont très demandés en Italie.",
        dureeHeures: "120h", nbMetiers: 9, icone: "🏗️", badge: "Formation en cours", ordre: 2, actif: true,
      },
      {
        cycleId, titre: "Restauration",
        description: "Pizzaiolo, cuisinier, serveur, barman, pâtissier, réceptionniste. Le tourisme italien recrute tout au long de l'année.",
        dureeHeures: "120h", nbMetiers: 7, icone: "🍕", badge: "", ordre: 3, actif: true,
      },
      {
        cycleId, titre: "Logistique / Transport",
        description: "Chauffeur poids lourd, cariste, magasinier, manutentionnaire. La logistique est un pilier de l'économie italienne.",
        dureeHeures: "120h", nbMetiers: 4, icone: "🚛", badge: "", ordre: 4, actif: true,
      },
      {
        cycleId, titre: "Métallurgie",
        description: "Soudeur, tourneur, mécanicien, chaudronnier, technicien maintenance. L'industrie mécanique italienne est réputée mondiale.",
        dureeHeures: "120h", nbMetiers: 6, icone: "⚙️", badge: "", ordre: 5, actif: true,
      },
      {
        cycleId, titre: "Autres secteurs moyens",
        description: "Employé de rayon, caissier, aide familiale, auxiliaire de vie. Des opportunités variées selon votre profil.",
        dureeHeures: "120h", nbMetiers: 5, icone: "🛒", badge: "", ordre: 6, actif: true,
      },
    ]);
    console.log("6 filières créées.");
  }

  // ─── Tarifs ──────────────────────────────────────────────────────────────
  if ((await db.select().from(tarifs)).length === 0) {
    await db.insert(tarifs).values([
      { cycleId, label: "Inscription", montantChiffres: "220 000", montantLettres: "220 000 FCFA", description: "Frais d'inscription", estTotal: false, ordre: 1 },
      { cycleId, label: "Reliquat sur formation", montantChiffres: "340 000", montantLettres: "340 000 FCFA", description: "Solde final après obtention du Nulla Osta", estTotal: false, ordre: 2 },
      { cycleId, label: "Total", montantChiffres: "560 000", montantLettres: "560 000 FCFA", description: "Coût total du programme", estTotal: true, ordre: 3 },
    ]);
    console.log("3 lignes de tarifs créées.");
  }

  // ─── Étapes du déroulement ───────────────────────────────────────────────
  if ((await db.select().from(etapes)).length === 0) {
    await db.insert(etapes).values([
      { cycleId, numero: "01", icone: "📝", titre: "Inscription", description: "Dépôt du dossier et paiement des frais d'inscription de 220 000 FCFA pour réserver votre place.", ordre: 1 },
      { cycleId, numero: "02", icone: "📖", titre: "Formation", description: "120 heures de cours théoriques et pratiques du 01/09 au 30/11/2026. Langue italienne, sécurité au travail et éducation civile.", ordre: 2 },
      { cycleId, numero: "03", icone: "✅", titre: "Validation", description: "Évaluations et tests des compétences. Validation après paiement complet de 560 000 FCFA.", ordre: 3 },
      { cycleId, numero: "04", icone: "📜", titre: "Attestation", description: "Délivrance de l'attestation de validation et accompagnement vers l'obtention du Nulla Osta pour l'Italie.", ordre: 4 },
    ]);
    console.log("4 étapes créées.");
  }

  // ─── Paramètres globaux ──────────────────────────────────────────────────
  if ((await db.select().from(parametres)).length === 0) {
    await db.insert(parametres).values([
      { cle: "org_name", valeur: "UNIMPRESA Sicilia" },
      { cle: "hero_subtitle", valeur: "Formation certifiante pour apprenants sénégalais" },
      { cle: "hero_description", valeur: "Préparez votre insertion professionnelle en Italie grâce à un programme certifiant de 120 heures, à Dakar." },
      { cle: "cta_inscription", valeur: "🎓 Je veux m'inscrire" },
      { cle: "cta_rdv", valeur: "📅 Prendre rendez-vous" },
      { cle: "cta_metiers", valeur: "📋 Découvrir les métiers" },
      { cle: "cta_final", valeur: "🎓 Commencer mon inscription" },
      { cle: "badge_certifiee", valeur: "Certifiée" },
      { cle: "badge_certifiee_label", valeur: "Formation" },
      { cle: "duree_label", valeur: "De cours" },
      { cle: "participants_label", valeur: "Participants" },
      { cle: "ville_label", valeur: "Sénégal" },
      { cle: "section_filieres_titre", valeur: "Nos filières de formation" },
      { cle: "section_filieres_soustitre", valeur: "Choisissez le métier qui vous correspond parmi nos secteurs porteurs en Italie." },
      { cle: "section_programme_titre", valeur: "Déroulement du programme" },
      { cle: "section_tarifs_titre", valeur: "Tarifs du programme" },
      { cle: "tarifs_col_description", valeur: "DESCRIPTION" },
      { cle: "tarifs_col_montant", valeur: "MONTANT" },
      { cle: "info_titre", valeur: "💡 Validation après paiement complet" },
      { cle: "info_texte", valeur: "L'attestation de validation est délivrée après seulement le paiement complet de l'inscription (220 000 FCFA) et du reliquat de (340 000 FCFA) pour un total de 560 000 FCFA." },
      { cle: "devise", valeur: "FCFA" },
      { cle: "couleur_fond", valeur: "#0f1f2e" },
      { cle: "couleur_principale", valeur: "#1a2a4a" },
      { cle: "couleur_accent", valeur: "#c9a227" },
      { cle: "logo_url", valeur: "" },
      { cle: "adresse_centre", valeur: "Centre Principal — Immeuble ISEG, Faculté de Droit, Dakar, Sénégal" },
      { cle: "contact_email", valeur: "contact@unimpresa-sicilia.com" },
      { cle: "contact_telephone", valeur: "+221 33 000 00 00" },
      { cle: "contact_whatsapp", valeur: "+221 77 000 00 00" },
      { cle: "footer_texte", valeur: "Programme de formation certifiant pour l'insertion professionnelle en Italie." },
    ]);
    console.log("Paramètres globaux créés.");
  }

  // ─── Compte Super Admin par défaut ───────────────────────────────────────
  if ((await db.select().from(admins)).length === 0) {
    await db.insert(admins).values({
      username: "admin",
      passwordHash: await bcrypt.hash("admin123", 10),
      role: "superadmin",
    });
    console.log("Compte admin créé (admin / admin123).");
  }

  // ─── Métiers détaillés par filière ───────────────────────────────────────
  const { filieres: filTable, partenaires, avantages } = await import("./schema");
  const METIERS: Record<string, string[]> = {
    "Agroalimentaire": ["Ouvrier agricole maraîcher", "Ouvrier agricole serres et cultures sous abri", "Tractoriste / Conducteur d'engins agricoles", "Ouvrier élevage bovins/volailles/porcs", "Ouvrier pisciculture", "Boulanger", "Boucher", "Opérateur fromager"],
    "Bâtiment / Construction": ["Maçon", "Ferrailleur", "Coffreur/Bancheur", "Poseur de carrelage et dallage", "Plâtrier/Plaquiste", "Électricien bâtiment", "Plombier/Installateur sanitaire", "Peintre en bâtiment", "Manœuvre spécialisé"],
    "Restauration": ["Pizzaiolo", "Cuisinier", "Serveur/Serveuse de salle", "Barman", "Pâtissier", "Employé housekeeping/hôtel", "Réceptionniste"],
    "Logistique / Transport": ["Chauffeur poids lourd CQC", "Cariste/Manutentionnaire chariot élévateur", "Magasinier/Préparateur de commandes", "Manutentionnaire/Facchinaggio"],
    "Métallurgie": ["Soudeur", "Tourneur/Fraiseur", "Mécanicien auto/industriel", "Monteur-assembleur mécanique", "Chaudronnier", "Technicien maintenance industrielle"],
    "Autres secteurs moyens": ["Employé de rayon/Scaffaliste", "Caissier", "Aide familiale/Badante", "Auxiliaire de vie", "Autres"],
  };
  const filRows = await db.select().from(filTable);
  for (const f of filRows) {
    if ((!f.metiers || f.metiers === "") && METIERS[f.titre]) {
      await db.update(filTable).set({ metiers: JSON.stringify(METIERS[f.titre]) }).where(eq2(filTable.id, f.id));
    }
  }

  // ─── Partenaires ─────────────────────────────────────────────────────────
  if ((await db.select().from(partenaires)).length === 0) {
    await db.insert(partenaires).values([
      { nom: "UNIMPRESA Sicilia", description: "Organisation patronale : Promotion des Entreprises et développement économique du territoire sicilien.", logo: "", ordre: 1, actif: true },
      { nom: "S.E.F.O.R.", description: "Servizi di Formazione Orientamento e Ricerca — Société d'Enseignement, d'Orientation et de Recherche.", logo: "", ordre: 2, actif: true },
      { nom: "CRISAF", description: "Formation sécurité au travail selon les normes italiennes. Centre de Recherche et d'Innovation pour le Développement en Afrique.", logo: "", ordre: 3, actif: true },
      { nom: "CPIA 2 Catania", description: "Centre Provincial pour l'Éducation des Adultes — Ministère italien de l'Instruction et du Mérite.", logo: "", ordre: 4, actif: true },
    ]);
    console.log("Partenaires créés.");
  }

  // ─── Avantages ───────────────────────────────────────────────────────────
  if ((await db.select().from(avantages)).length === 0) {
    await db.insert(avantages).values([
      { icone: "✅", titre: "Formation certifiée et reconnue", description: "Notre programme est reconnu par les institutions italiennes et sénégalaises pour sa qualité et sa conformité.", ordre: 1, actif: true },
      { icone: "👨‍🏫", titre: "Intervenants qualifiés et expérimentés", description: "Des formateurs experts dans leurs domaines avec une expérience internationale.", ordre: 2, actif: true },
      { icone: "📋", titre: "Contenu conforme aux normes italiennes", description: "Programme aligné sur les exigences du Décret Flussi et du marché du travail italien.", ordre: 3, actif: true },
      { icone: "🤝", titre: "Accompagnement personnalisé", description: "Suivi individuel tout au long de votre parcours et après la formation.", ordre: 4, actif: true },
      { icone: "💼", titre: "Opportunités réelles d'emploi en Italie", description: "Partenariats avec des employeurs italiens pour faciliter votre insertion professionnelle.", ordre: 5, actif: true },
    ]);
    console.log("Avantages créés.");
  }

  console.log("Seed terminé.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
