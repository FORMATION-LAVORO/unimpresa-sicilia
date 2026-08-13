/**
 * Contenu de repli (valeurs des captures) utilisé UNIQUEMENT si la base
 * de données est momentanément injoignable ou vide — le site reste
 * fonctionnel dans tous les cas, comme exigé par le cahier des charges.
 */
export const FALLBACK_PARAMS: Record<string, string> = {
  org_name: "UNIMPRESA Sicilia",
  hero_subtitle: "Formation certifiante pour apprenants sénégalais",
  hero_description:
    "Préparez votre insertion professionnelle en Italie grâce à un programme certifiant de 120 heures, à Dakar.",
  cta_inscription: "🎓 Je veux m'inscrire",
  cta_rdv: "📅 Prendre rendez-vous",
  cta_metiers: "📋 Découvrir les métiers",
  cta_final: "🎓 Commencer mon inscription",
  badge_certifiee: "Certifiée",
  badge_certifiee_label: "Formation",
  duree_label: "De cours",
  participants_label: "Participants",
  ville_label: "Sénégal",
  section_filieres_titre: "Nos filières de formation",
  section_filieres_soustitre:
    "Choisissez le métier qui vous correspond parmi nos secteurs porteurs en Italie.",
  section_programme_titre: "Déroulement du programme",
  section_tarifs_titre: "Tarifs du programme",
  tarifs_col_description: "DESCRIPTION",
  tarifs_col_montant: "MONTANT",
  info_titre: "💡 Validation après paiement complet",
  info_texte:
    "L'attestation de validation est délivrée après seulement le paiement complet de l'inscription (220 000 FCFA) et du reliquat de (340 000 FCFA) pour un total de 560 000 FCFA.",
  devise: "FCFA",
  couleur_fond: "#0f1f2e",
  couleur_principale: "#1a2a4a",
  couleur_accent: "#c9a227",
  logo_url: "",
  adresse_centre: "Centre Principal — Immeuble ISEG, Faculté de Droit, Dakar, Sénégal",
  contact_email: "contact@unimpresa-sicilia.com",
  contact_telephone: "+221 33 000 00 00",
  contact_whatsapp: "+221 77 000 00 00",
  footer_texte: "Programme de formation certifiant pour l'insertion professionnelle en Italie.",
};

export const FALLBACK_CYCLE = {
  id: 1,
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
  createdAt: new Date("2026-01-01"),
};

export const FALLBACK_FILIERES = [
  { id: 1, cycleId: 1, titre: "Agroalimentaire", description: "Ouvrier agricole, tractoriste, boulanger, boucher, opérateur fromager. Formez-vous aux métiers de la terre et de l'alimentation en Italie.", dureeHeures: "120h", nbMetiers: 8, icone: "🌾", badge: "", ordre: 1, actif: true },
  { id: 2, cycleId: 1, titre: "Bâtiment / Construction", description: "Maçon, ferrailleur, coffreur, électricien, plombier, peintre. Les métiers du BTP sont très demandés en Italie.", dureeHeures: "120h", nbMetiers: 9, icone: "🏗️", badge: "Formation en cours", ordre: 2, actif: true },
  { id: 3, cycleId: 1, titre: "Restauration", description: "Pizzaiolo, cuisinier, serveur, barman, pâtissier, réceptionniste. Le tourisme italien recrute tout au long de l'année.", dureeHeures: "120h", nbMetiers: 7, icone: "🍕", badge: "", ordre: 3, actif: true },
  { id: 4, cycleId: 1, titre: "Logistique / Transport", description: "Chauffeur poids lourd, cariste, magasinier, manutentionnaire. La logistique est un pilier de l'économie italienne.", dureeHeures: "120h", nbMetiers: 4, icone: "🚛", badge: "", ordre: 4, actif: true },
  { id: 5, cycleId: 1, titre: "Métallurgie", description: "Soudeur, tourneur, mécanicien, chaudronnier, technicien maintenance. L'industrie mécanique italienne est réputée mondiale.", dureeHeures: "120h", nbMetiers: 6, icone: "⚙️", badge: "", ordre: 5, actif: true },
  { id: 6, cycleId: 1, titre: "Autres secteurs moyens", description: "Employé de rayon, caissier, aide familiale, auxiliaire de vie. Des opportunités variées selon votre profil.", dureeHeures: "120h", nbMetiers: 5, icone: "🛒", badge: "", ordre: 6, actif: true },
];

export const FALLBACK_TARIFS = [
  { id: 1, cycleId: 1, label: "Inscription", montantChiffres: "220 000", montantLettres: "220 000 FCFA", description: "Frais d'inscription", estTotal: false, ordre: 1 },
  { id: 2, cycleId: 1, label: "Reliquat sur formation", montantChiffres: "340 000", montantLettres: "340 000 FCFA", description: "Solde final après obtention du Nulla Osta", estTotal: false, ordre: 2 },
  { id: 3, cycleId: 1, label: "Total", montantChiffres: "560 000", montantLettres: "560 000 FCFA", description: "Coût total du programme", estTotal: true, ordre: 3 },
];

export const FALLBACK_ETAPES = [
  { id: 1, cycleId: 1, numero: "01", icone: "📝", titre: "Inscription", description: "Dépôt du dossier et paiement des frais d'inscription de 220 000 FCFA pour réserver votre place.", ordre: 1 },
  { id: 2, cycleId: 1, numero: "02", icone: "📖", titre: "Formation", description: "120 heures de cours théoriques et pratiques du 01/09 au 30/11/2026. Langue italienne, sécurité au travail et éducation civile.", ordre: 2 },
  { id: 3, cycleId: 1, numero: "03", icone: "✅", titre: "Validation", description: "Évaluations et tests des compétences. Validation après paiement complet de 560 000 FCFA.", ordre: 3 },
  { id: 4, cycleId: 1, numero: "04", icone: "📜", titre: "Attestation", description: "Délivrance de l'attestation de validation et accompagnement vers l'obtention du Nulla Osta pour l'Italie.", ordre: 4 },
];
