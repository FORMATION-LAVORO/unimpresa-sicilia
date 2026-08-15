import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAdmin, Btn, Table, inputCls } from "../ui";

const STATUTS = ["nouveau", "contacté", "confirmé", "admis", "payé", "refusé"];
const STATUT_STYLE: Record<string, string> = {
  nouveau: "bg-blue-100 text-blue-700",
  contacté: "bg-amber-100 text-amber-700",
  confirmé: "bg-green-100 text-green-700",
  admis: "bg-indigo-100 text-indigo-700",
  payé: "bg-emerald-100 text-emerald-800",
  refusé: "bg-red-100 text-red-700",
};
const RESULTATS = ["", "en_attente", "réussi", "échoué"];
const RESULTAT_LABEL: Record<string, string> = { "": "—", en_attente: "⏳ en attente", "réussi": "✅ réussi", "échoué": "❌ échoué" };

const fmt = (n: number) => n.toLocaleString("fr-FR").replace(/,/g, " ");

export default function InscriptionsSection() {
  const { token, refresh } = useAdmin();
  const { data } = trpc.admin.listInscriptions.useQuery({ token });
  const { data: centres } = trpc.admin.listCentres.useQuery({ token });
  const { data: salles } = trpc.admin.listSalles.useQuery({ token });
  const { data: paiements } = trpc.admin.listPaiements.useQuery({ token });
  const { data: tarifs } = trpc.admin.listTarifs.useQuery({ token });
  const update = trpc.admin.updateInscription.useMutation({ onSuccess: refresh });
  const updateNature = trpc.admin.updateNatureCandidat.useMutation({ onSuccess: refresh });
  const affecter = trpc.admin.affecterCandidat.useMutation({ onSuccess: refresh });
  const setResultat = trpc.admin.setResultatTest.useMutation({ onSuccess: refresh });
  const del = trpc.admin.deleteInscription.useMutation({ onSuccess: refresh });

  const [dossierOuvert, setDossierOuvert] = useState<number | null>(null);

  // Total théorique (ligne « Total » des tarifs, sinon somme)
  const totalTheorique = (tarifs ?? []).filter((t) => t.estTotal).reduce((s, t) => s + Number((t.montantChiffres || "0").replace(/\s/g, "")), 0)
    || (tarifs ?? []).reduce((s, t) => s + Number((t.montantChiffres || "0").replace(/\s/g, "")), 0);

  const payePar = (id: number) =>
    (paiements ?? []).filter((p) => Number(p.inscriptionId) === id)
      .reduce((s, p) => s + Number((p.montantChiffres || "0").replace(/\s/g, "")), 0);

  return (
    <section>
      <h2 className="text-xl font-extrabold text-[#1a2a4a] mb-2">
        Inscriptions candidats ({data?.length ?? 0})
      </h2>
      <p className="text-sm text-slate-500 mb-4">
        Tout est chaîné automatiquement : <b>admis</b> → fiche travailleur créée · <b>affectation</b> → compteur de la salle mis à jour ·
        <b> test réussi</b> → réussite enregistrée · paiements → comptabilité (sauf boursiers).
      </p>
      <Table head={["Dossier", "Candidat", "Filière / Métier", "Centre / Salle", "Paiement", "Test", "Statut", "Actions"]}>
        {(data ?? []).map((i) => {
          const id = Number(i.id);
          const paye = payePar(id);
          const centre = centres?.find((c) => Number(c.id) === Number(i.centreId));
          const salle = salles?.find((s) => Number(s.id) === Number(i.salleId));
          return (
            <tr key={i.id} className="border-t border-slate-100 align-top">
              <td className="px-4 py-3">
                <div className="font-mono font-bold text-[#8a6d1a] whitespace-nowrap">{i.numeroDossier || "—"}</div>
                <div className="text-xs text-slate-400">{new Date(i.createdAt).toLocaleDateString("fr-FR")}</div>
              </td>
              <td className="px-4 py-3">
                <div className="font-bold text-[#1a2a4a] whitespace-nowrap">{i.prenom} {i.nom}</div>
                <div className="text-xs text-slate-500">{i.sexe} · {i.situationFamiliale}</div>
                <div className="text-xs text-slate-400">{i.telephone}</div>
                <select
                  className={`mt-1 text-xs font-bold px-2 py-0.5 rounded-full border-0 cursor-pointer ${i.natureCandidat === "boursier" ? "bg-purple-100 text-purple-800" : "bg-slate-100 text-slate-700"}`}
                  value={i.natureCandidat}
                  onChange={(e) => updateNature.mutate({ token, id, nature: e.target.value })}
                >
                  <option value="payant">💰 payant</option>
                  <option value="boursier">🎓 boursier</option>
                </select>
              </td>
              <td className="px-4 py-3">
                <div className="font-semibold text-sm">{i.filiereLabel}</div>
                <div className="text-xs text-slate-500">{i.metierChoisi}</div>
              </td>
              <td className="px-4 py-3 min-w-44">
                <select
                  className={`${inputCls} mb-1.5 text-xs py-1.5`}
                  value={i.centreId ?? ""}
                  onChange={(e) => affecter.mutate({ token, id, centreId: e.target.value ? Number(e.target.value) : null, salleId: i.salleId ?? null })}
                >
                  <option value="">— Centre —</option>
                  {(centres ?? []).map((c) => <option key={c.id} value={Number(c.id)}>{c.nom} ({c.ville})</option>)}
                </select>
                <select
                  className={`${inputCls} text-xs py-1.5`}
                  value={i.salleId ?? ""}
                  onChange={(e) => affecter.mutate({ token, id, centreId: i.centreId ?? null, salleId: e.target.value ? Number(e.target.value) : null })}
                >
                  <option value="">— Salle / amphi —</option>
                  {(salles ?? []).map((s) => (
                    <option key={s.id} value={Number(s.id)} disabled={s.capacite > 0 && s.occupation >= s.capacite && Number(s.id) !== Number(i.salleId)}>
                      {s.nom} ({s.occupation}/{s.capacite}){s.capacite > 0 && s.occupation >= s.capacite ? " 🔴 pleine" : ""}
                    </option>
                  ))}
                </select>
                {(centre || salle) && (
                  <div className="text-xs text-slate-400 mt-1">📍 {[centre?.nom, salle?.nom].filter(Boolean).join(" · ")}</div>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {i.natureCandidat === "boursier" ? (
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">exonéré</span>
                ) : totalTheorique > 0 && paye >= totalTheorique ? (
                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-bold">✅ soldé</span>
                ) : paye > 0 ? (
                  <>
                    <div className="text-sm font-bold">{fmt(paye)} FCFA payés</div>
                    <div className="text-xs font-semibold text-amber-700">reliquat : {fmt(totalTheorique - paye)} FCFA</div>
                  </>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-bold">non payé</span>
                )}
              </td>
              <td className="px-4 py-3">
                <select
                  className={`text-xs font-bold px-2 py-1 rounded-full border-0 cursor-pointer ${i.resultatTest === "réussi" ? "bg-green-100 text-green-800" : i.resultatTest === "échoué" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}
                  value={i.resultatTest}
                  onChange={(e) => setResultat.mutate({ token, id, resultat: e.target.value })}
                >
                  {RESULTATS.map((r) => <option key={r} value={r}>{RESULTAT_LABEL[r]}</option>)}
                </select>
              </td>
              <td className="px-4 py-3">
                <select
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-full border-0 cursor-pointer ${STATUT_STYLE[i.statut] ?? "bg-slate-100"}`}
                  value={i.statut}
                  onChange={(e) => update.mutate({ token, id, statut: e.target.value })}
                >
                  {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {i.statut === "admis" && <div className="text-[10px] text-indigo-500 mt-1">→ fiche travailleur auto</div>}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <button
                  title="Voir le dossier complet"
                  className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold mr-1.5 hover:bg-slate-200"
                  onClick={() => setDossierOuvert(dossierOuvert === id ? null : id)}
                >📂</button>
                <Btn variant="danger" onClick={() => confirm("Supprimer cette inscription ?") && del.mutate({ token, id })}>🗑</Btn>
              </td>
            </tr>
          );
        })}
        {(data ?? []).length === 0 && (
          <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">Aucune inscription pour le moment.</td></tr>
        )}
      </Table>

      {dossierOuvert && <DossierCandidat id={dossierOuvert} onClose={() => setDossierOuvert(null)} />}
    </section>
  );
}

/** Dossier complet d'un candidat : identité, paiements, affectation, test, placement */
function DossierCandidat({ id, onClose }: { id: number; onClose: () => void }) {
  const { token } = useAdmin();
  const { data: d } = trpc.admin.dossierCandidat.useQuery({ token, id });

  if (!d) return <div className="mt-4 bg-white rounded-xl border border-slate-200 p-6 text-slate-400">Chargement…</div>;
  const i = d.inscription;

  const Ligne = ({ k, v }: { k: string; v: React.ReactNode }) => (
    <div className="flex justify-between gap-4 py-1.5 border-b border-slate-100 text-sm">
      <span className="text-slate-500 font-semibold">{k}</span>
      <span className="text-right font-semibold text-[#1a2a4a]">{v}</span>
    </div>
  );

  return (
    <div className="mt-4 bg-white rounded-xl border-2 border-[#c9a227] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-[#1a2a4a] text-lg">📂 Dossier {i.numeroDossier} — {i.prenom} {i.nom}</h3>
        <Btn variant="ghost" onClick={onClose}>Fermer ✕</Btn>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-bold text-slate-600 text-xs uppercase mb-2">Identité & formation</h4>
          <Ligne k="Né(e) le" v={<>{i.dateNaissance}{i.lieuNaissance ? ` à ${i.lieuNaissance}` : ""}</>} />
          <Ligne k="Sexe / situation" v={`${i.sexe} · ${i.situationFamiliale}`} />
          <Ligne k="Nature" v={i.natureCandidat === "boursier" ? "🎓 Boursier (non payant)" : "💰 Payant"} />
          <Ligne k="Filière / métier" v={`${i.filiereLabel} — ${i.metierChoisi}`} />
          <Ligne k="Centre" v={d.centre ? `${d.centre.nom} (${d.centre.ville})` : "non affecté"} />
          <Ligne k="Salle / amphi" v={d.salle ? d.salle.nom : "non affecté"} />
          <Ligne k="Test" v={RESULTAT_LABEL[i.resultatTest] ?? "—"} />
          <Ligne k="Fiche travailleur" v={d.travailleur ? `✅ créée (TR-${String(d.travailleur.id).padStart(4, "0")})` : "—"} />
        </div>
        <div>
          <h4 className="font-bold text-slate-600 text-xs uppercase mb-2">Paiements ({d.paiements.length})</h4>
          {i.natureCandidat === "boursier" && <p className="text-sm text-purple-700 font-semibold mb-2">Candidat boursier — exonéré de paiement.</p>}
          {d.paiements.map((p) => (
            <div key={p.id} className="flex justify-between text-sm py-1.5 border-b border-slate-100">
              <span>{p.date} · <b>{p.nature}</b> · {p.modePaiement}</span>
              <span className="font-bold">{p.montantChiffres} FCFA</span>
            </div>
          ))}
          {d.paiements.length === 0 && i.natureCandidat !== "boursier" && <p className="text-sm text-slate-400">Aucun paiement enregistré.</p>}
          <div className="mt-3 bg-slate-50 rounded-lg p-3 text-sm">
            <div className="flex justify-between"><span>Total payé</span><b>{fmt(d.paye)} FCFA</b></div>
            {d.total > 0 && <div className="flex justify-between"><span>Coût total formation</span><b>{fmt(d.total)} FCFA</b></div>}
            {d.total > 0 && (
              <div className="flex justify-between mt-1 pt-1 border-t border-slate-200">
                <span>Situation</span>
                <b className={d.reste > 0 ? "text-amber-700" : "text-green-700"}>{d.reste > 0 ? `reliquat : ${fmt(d.reste)} FCFA` : "soldé ✅"}</b>
              </div>
            )}
          </div>
          {d.placements.length > 0 && (
            <>
              <h4 className="font-bold text-slate-600 text-xs uppercase mt-4 mb-2">Réussites / contrats</h4>
              {d.placements.map((p) => (
                <div key={p.id} className="text-sm py-1.5 border-b border-slate-100">
                  {p.type === "contrat" ? "📄" : "🎓"} {p.type === "contrat" ? `${p.poste} chez ${p.entreprise} (${p.ville})` : "Test de formation réussi"} — <b>{p.statut}</b>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
