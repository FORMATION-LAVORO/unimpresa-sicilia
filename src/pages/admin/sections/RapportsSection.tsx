import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAdmin, Btn } from "../ui";

const fmt = (n: number) => n.toLocaleString("fr-FR").replace(/,/g, " ");

export default function RapportsSection() {
  const { token } = useAdmin();
  const { data: r } = trpc.admin.rapportSynthese.useQuery({ token });
  const [destinataire, setDestinataire] = useState("Ambassade d'Italie à Dakar");

  if (!r) return <p className="text-slate-400">Chargement du rapport…</p>;

  const lignes = [
    ["Candidats inscrits", String(r.inscrits)],
    ["— dont payants", String(r.payants)],
    ["— dont boursiers", String(r.boursiers)],
    ["Travailleurs en formation", String(r.travailleursFormes)],
    ["Réussites / certifications", String(r.reussites)],
    ["Contrats de travail conclus en Italie", String(r.contratsConclus)],
    ["Taux de placement", `${r.tauxPlacement} %`],
    ["Recettes totales", `${fmt(r.recettes)} FCFA (${r.recettesLettres})`],
    ["Dépenses totales", `${fmt(r.depenses)} FCFA`],
    ["Solde", `${fmt(r.solde)} FCFA (${r.soldeLettres})`],
    ["Centres de formation partenaires", String(r.centres)],
    ["Salles et amphithéâtres", String(r.salles)],
    ["Capacité d'accueil totale", `${r.capaciteTotale} places`],
    ["Encadrement (tuteurs & enseignants)", String(r.encadrement)],
  ];

  const imprimer = () => window.print();

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 print:hidden">
        <h2 className="text-xl font-extrabold text-[#1a2a4a]">📑 Rapports officiels</h2>
        <div className="flex gap-2 items-center">
          <select className="px-3 py-2 rounded-lg border border-slate-300 text-sm" value={destinataire} onChange={(e) => setDestinataire(e.target.value)}>
            <option>Ambassade d'Italie à Dakar</option>
            <option>Ambassade du Sénégal en Italie</option>
            <option>Ministère de la Formation professionnelle</option>
            <option>Ministère de l'Emploi</option>
            <option>Chambre des Métiers de Dakar</option>
            <option>Partenaires / bailleurs</option>
          </select>
          <Btn variant="gold" onClick={imprimer}>🖨️ Imprimer / PDF</Btn>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-10 max-w-4xl print:border-0 print:shadow-none" id="rapport">
        <div className="text-center border-b-2 border-[#1a2a4a] pb-4 mb-6">
          <div className="text-2xl font-extrabold text-[#1a2a4a]">UNIMPRESA Sicilia</div>
          <div className="text-sm text-slate-500">Programme de formation professionnelle Dakar → Italie</div>
          <div className="mt-2 text-lg font-bold">Rapport de synthèse à l'attention de : {destinataire}</div>
          <div className="text-xs text-slate-400">Édité le {r.dateEdition}</div>
        </div>

        <h3 className="font-extrabold text-[#1a2a4a] mb-2">1. Cycles de formation</h3>
        <table className="w-full text-sm mb-6 border border-slate-200">
          <thead><tr className="bg-slate-50">{["Cycle", "Session", "Volume horaire", "Participants prévus"].map((h) => <th key={h} className="px-3 py-2 text-left font-bold border-b border-slate-200">{h}</th>)}</tr></thead>
          <tbody>{r.cycles.map((c, i) => <tr key={i} className="border-b border-slate-100"><td className="px-3 py-2">{c.nom}</td><td className="px-3 py-2">{c.session}</td><td className="px-3 py-2">{c.heures} h</td><td className="px-3 py-2">{c.participants}</td></tr>)}</tbody>
        </table>

        <h3 className="font-extrabold text-[#1a2a4a] mb-2">2. Indicateurs clés</h3>
        <table className="w-full text-sm mb-6 border border-slate-200">
          <tbody>
            {lignes.map(([k, v], i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="px-3 py-2 font-semibold w-1/2">{k}</td>
                <td className="px-3 py-2">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="font-extrabold text-[#1a2a4a] mb-2">3. Répartition par filière</h3>
        <table className="w-full text-sm mb-6 border border-slate-200">
          <thead><tr className="bg-slate-50">{["Filière", "Inscrits", "Contrats conclus"].map((h) => <th key={h} className="px-3 py-2 text-left font-bold border-b border-slate-200">{h}</th>)}</tr></thead>
          <tbody>{r.parFiliere.map((f, i) => <tr key={i} className="border-b border-slate-100"><td className="px-3 py-2">{f.filiere}</td><td className="px-3 py-2">{f.inscrits}</td><td className="px-3 py-2">{f.contrats}</td></tr>)}</tbody>
        </table>

        {r.parCentre.length > 0 && (
          <>
            <h3 className="font-extrabold text-[#1a2a4a] mb-2">4. Centres de formation partenaires</h3>
            <table className="w-full text-sm mb-6 border border-slate-200">
              <thead><tr className="bg-slate-50">{["Centre", "Partenaire", "Type", "Ville", "Capacité", "Inscrits"].map((h) => <th key={h} className="px-3 py-2 text-left font-bold border-b border-slate-200">{h}</th>)}</tr></thead>
              <tbody>{r.parCentre.map((c, i) => <tr key={i} className="border-b border-slate-100"><td className="px-3 py-2">{c.centre}</td><td className="px-3 py-2">{c.partenaire}</td><td className="px-3 py-2">{c.type}</td><td className="px-3 py-2">{c.ville}</td><td className="px-3 py-2">{c.capacite}</td><td className="px-3 py-2">{c.inscrits}</td></tr>)}</tbody>
            </table>
          </>
        )}

        <div className="mt-8 text-sm text-slate-600">
          <p className="font-bold text-[#1a2a4a] mb-1">Conclusions</p>
          <p>
            Le programme compte {r.inscrits} candidats inscrits ({r.boursiers} boursiers). {r.contratsConclus} contrats de travail
            ont été conclus en Italie, soit un taux de placement de {r.tauxPlacement} %.
            La situation financière fait ressortir un solde de {fmt(r.solde)} FCFA ({r.soldeLettres} francs CFA).
          </p>
          <p className="mt-4">Fait à Dakar, le {r.dateEdition}</p>
          <p className="mt-6 font-bold">Pour UNIMPRESA Sicilia — La Direction</p>
        </div>
      </div>
    </section>
  );
}
