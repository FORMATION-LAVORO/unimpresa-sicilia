import jwt from "jsonwebtoken";
import * as XLSX from "xlsx";
import { desc, asc } from "drizzle-orm";
import { getDb } from "../queries/connection";
import {
  travailleurs,
  transactions,
  placements,
  inscriptions,
  offresEmploi,
  salles,
  tuteurs,
  matchings,
} from "../../db/schema";

const JWT_SECRET = process.env.JWT_SECRET ?? "unimpresa-dev-secret";

export function verifyAdminToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

type Dataset = { headers: string[]; rows: (string | number)[][]; sheet: string };

async function buildDataset(name: string): Promise<Dataset | null> {
  const db = getDb();
  const S = (v: any) => (v === null || v === undefined ? "" : String(v));
  const N = (v: any) => (v === null || v === undefined || v === "" ? 0 : Number(v));

  switch (name) {
    case "travailleurs": {
      const rows = await db.select().from(travailleurs).orderBy(desc(travailleurs.id));
      return {
        sheet: "Travailleurs",
        headers: ["ID", "Nom", "Prénom", "Âge", "Sexe", "Téléphone", "Email", "Profession", "Métier", "Compétences", "Expérience (ans)", "Niveau italien", "Autres langues", "Statut"],
        rows: rows.map((r) => [N(r.id), r.nom, r.prenom, N(r.age), r.sexe, r.telephone, r.email, r.profession, r.metier, r.competences, N(r.experienceAnnees), r.niveauItalien, r.autresLangues, r.statut]),
      };
    }
    case "comptabilite": {
      const rows = await db.select().from(transactions).orderBy(desc(transactions.id));
      return {
        sheet: "Comptabilité",
        headers: ["ID", "Date", "Type", "Catégorie", "Libellé", "Montant (chiffres)", "Montant (lettres)", "Mode de paiement", "Notes"],
        rows: rows.map((r) => [N(r.id), r.date, r.type, r.categorie, r.libelle, S(r.montantChiffres), r.montantLettres, r.modePaiement, r.notes]),
      };
    }
    case "placements": {
      const rows = await db.select().from(placements).orderBy(desc(placements.id));
      return {
        sheet: "Placements",
        headers: ["ID", "Nom complet", "Type", "Entreprise", "Poste", "Ville", "Type de contrat", "Date", "Salaire", "Statut", "Notes"],
        rows: rows.map((r) => [N(r.id), r.nomComplet, r.type, r.entreprise, r.poste, r.ville, r.typeContrat, r.dateEvenement, r.salaire, r.statut, r.notes]),
      };
    }
    case "inscriptions": {
      const rows = await db.select().from(inscriptions).orderBy(desc(inscriptions.id));
      return {
        sheet: "Inscriptions",
        headers: ["ID", "N° dossier", "Nom", "Prénom", "Email", "Téléphone", "Filière", "Métier choisi", "Cycle", "Statut", "Date de naissance", "Profession"],
        rows: rows.map((r) => [N(r.id), r.numeroDossier, r.nom, r.prenom, r.email, r.telephone, r.filiereLabel, r.metierChoisi, r.cycleLabel, r.statut, r.dateNaissance, r.profession]),
      };
    }
    case "offres": {
      const rows = await db.select().from(offresEmploi).orderBy(desc(offresEmploi.id));
      return {
        sheet: "Offres",
        headers: ["ID", "Titre", "Entreprise", "Ville", "Métier", "Type de contrat", "Salaire", "Statut", "Description"],
        rows: rows.map((r) => [N(r.id), r.titre, r.entreprise, r.ville, r.metier, r.typeContrat, r.salaire, r.statut, r.description]),
      };
    }
    case "salles": {
      const rows = await db.select().from(salles).orderBy(asc(salles.nom));
      return {
        sheet: "Salles",
        headers: ["ID", "Nom", "Type", "Capacité", "Occupation", "Remplissage (%)", "Seuil alerte (%)", "Alerte", "Localisation", "Équipements"],
        rows: rows.map((r) => {
          const pct = r.capacite > 0 ? Math.round((r.occupation / r.capacite) * 100) : 0;
          return [N(r.id), r.nom, r.type, N(r.capacite), N(r.occupation), pct, N(r.seuilAlerte), pct >= r.seuilAlerte ? "ALERTE" : "OK", r.localisation, r.equipements];
        }),
      };
    }
    case "tuteurs": {
      const rows = await db.select().from(tuteurs).orderBy(asc(tuteurs.nom));
      return {
        sheet: "Tuteurs",
        headers: ["ID", "Nom", "Prénom", "Rôle", "Spécialité", "Téléphone", "Email", "Langues", "Statut"],
        rows: rows.map((r) => [N(r.id), r.nom, r.prenom, r.role, r.specialite, r.telephone, r.email, r.langues, r.statut]),
      };
    }
    case "matchings": {
      const rows = await db.select().from(matchings).orderBy(desc(matchings.id));
      return {
        sheet: "Matchings",
        headers: ["ID", "Travailleur ID", "Offre ID", "Filière ID", "Type", "Score", "Statut", "Notes"],
        rows: rows.map((r) => [N(r.id), N(r.travailleurId), S(r.offreId), S(r.filiereId), r.type, N(r.score), r.statut, r.notes]),
      };
    }
    default:
      return null;
  }
}

/** Génère un classeur Excel (.xlsx) pour un jeu de données donné. Retourne null si inconnu. */
export async function buildExcel(name: string): Promise<{ buffer: Buffer; filename: string } | null> {
  const ds = await buildDataset(name);
  if (!ds) return null;
  const ws = XLSX.utils.aoa_to_sheet([ds.headers, ...ds.rows]);
  ws["!cols"] = ds.headers.map((h, i) => ({
    wch: Math.max(h.length + 2, ...ds.rows.slice(0, 200).map((r) => String(r[i] ?? "").length + 2), 10),
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, ds.sheet);
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const date = new Date().toISOString().slice(0, 10);
  return { buffer, filename: `${name}-${date}.xlsx` };
}

export const EXPORTABLE = ["travailleurs", "comptabilite", "placements", "inscriptions", "offres", "salles", "tuteurs", "matchings"];
