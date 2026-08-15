import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAdmin, Field, Btn, Table, ExportBtn, inputCls } from "../ui";

const empty = {
  inscriptionId: 0,
  date: new Date().toISOString().slice(0, 10),
  nature: "inscription",
  montantChiffres: "",
  montantLettres: "",
  modePaiement: "espèces",
  reference: "",
  notes: "",
};
type Form = typeof empty;

const fmt = (n: number) => n.toLocaleString("fr-FR").replace(/,/g, " ");

export default function PaiementsSection() {
  const { token, refresh } = useAdmin();
  const { data: paiements } = trpc.admin.listPaiements.useQuery({ token });
  const { data: inscriptions } = trpc.admin.listInscriptions.useQuery({ token });
  const { data: alertes } = trpc.admin.alertesNonPayants.useQuery({ token });
  const create = trpc.admin.createPaiement.useMutation({ onSuccess: refresh });
  const del = trpc.admin.deletePaiement.useMutation({ onSuccess: refresh });
  const setDispo = trpc.admin.setDispositionPaiement.useMutation({ onSuccess: refresh });

  const [form, setForm] = useState<Form>(empty);
  const [showForm, setShowForm] = useState(false);
  const set = (k: keyof Form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const { data: situation } = trpc.admin.situationPaiement.useQuery(
    { token, inscriptionId: form.inscriptionId },
    { enabled: form.inscriptionId > 0 },
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.inscriptionId) return alert("Choisissez un candidat");
    await create.mutateAsync({ token, data: form });
    setForm(empty); setShowForm(false);
  };

  const nomCandidat = (id: number) => {
    const i = inscriptions?.find((x) => Number(x.id) === id);
    return i ? `${i.prenom} ${i.nom}` : `#${id}`;
  };

  // Totaux par candidat
  const parCandidat = (inscriptions ?? []).map((i) => {
    const rows = (paiements ?? []).filter((p) => Number(p.inscriptionId) === Number(i.id));
    const paye = rows.reduce((s, p) => s + Number((p.montantChiffres || "0").replace(/\s/g, "")), 0);
    return { id: Number(i.id), nom: `${i.prenom} ${i.nom}`, nature: i.natureCandidat, statut: i.statut, disposition: i.dispositionPaiement, paye, nb: rows.length };
  }).filter((c) => c.nb > 0 || c.statut === "accepté" || c.statut === "admis" || c.statut === "payé");

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-extrabold text-[#1a2a4a]">💳 Paiements candidats</h2>
        <div className="flex gap-2">
          <ExportBtn dataset="paiements" />
          <Btn variant="gold" onClick={() => { setForm(empty); setShowForm(!showForm); }}>
            {showForm ? "Fermer" : "+ Encaisser un paiement"}
          </Btn>
        </div>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Chaque paiement enregistré ici alimente <b>automatiquement la comptabilité</b> (recette).
        Nature : <b>inscription</b> (1er versement) ou <b>reliquat</b> (solde). Les candidats boursiers n'ont rien à payer.
      </p>

      {/* Alertes non-payants */}
      {(alertes ?? []).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <div className="font-bold text-red-800 mb-2">🚨 Candidats en attente de paiement ({alertes!.length})</div>
          <div className="space-y-1.5">
            {alertes!.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <div>
                  <b>{a.nom}</b>
                  <span className="text-red-700"> — {a.niveau === "jamais_payé" ? "n'a encore rien payé" : `reliquat dû : ${fmt(a.reste)} FCFA`}</span>
                  <span className="text-xs text-slate-500"> ({a.disposition})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{a.telephone}</span>
                  <button
                    className="px-2.5 py-1 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700"
                    onClick={() => { setForm({ ...empty, inscriptionId: a.id, nature: a.niveau === "jamais_payé" ? "inscription" : "reliquat" }); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  >💳 Encaisser</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 grid sm:grid-cols-2 gap-4">
          <Field label="Candidat">
            <select required className={inputCls} value={form.inscriptionId || ""} onChange={(e) => set("inscriptionId", Number(e.target.value))}>
              <option value="">— Choisir —</option>
              {(inscriptions ?? []).map((i) => (
                <option key={i.id} value={Number(i.id)}>
                  {i.prenom} {i.nom} ({i.natureCandidat === "boursier" ? "boursier" : "payant"})
                </option>
              ))}
            </select>
          </Field>
          {situation && form.inscriptionId > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <b>Situation du candidat :</b> payé {fmt(situation.paye)} FCFA
              {situation.total > 0 && <> sur {fmt(situation.total)} FCFA — <b className="text-blue-800">reste {fmt(situation.reste)} FCFA</b></>}
              {situation.reste === 0 && situation.total > 0 && <span className="ml-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-bold">soldé ✅</span>}
            </div>
          )}
          <Field label="Date"><input required type="date" className={inputCls} value={form.date} onChange={(e) => set("date", e.target.value)} /></Field>
          <Field label="Nature">
            <select className={inputCls} value={form.nature} onChange={(e) => set("nature", e.target.value)}>
              <option value="inscription">Frais d'inscription</option>
              <option value="mensualité">Mensualité</option>
              <option value="reliquat">Reliquat / solde</option>
              <option value="reliquat_nulla_osta">Reliquat au Nulla Osta</option>
              <option value="autre">Autre</option>
            </select>
          </Field>
          <Field label="Montant (chiffres)"><input required className={inputCls} value={form.montantChiffres} onChange={(e) => set("montantChiffres", e.target.value)} placeholder="220 000" /></Field>
          <Field label="Mode de paiement">
            <select className={inputCls} value={form.modePaiement} onChange={(e) => set("modePaiement", e.target.value)}>
              {["Wave", "Orange Money", "espèces", "virement", "Free Money", "chèque", "autre"].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Référence / reçu n°"><input className={inputCls} value={form.reference} onChange={(e) => set("reference", e.target.value)} /></Field>
          <Field label="Notes"><textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
          <p className="text-xs text-slate-500 self-end">💡 Le montant en lettres est généré automatiquement. La recette est ajoutée à la comptabilité.</p>
          <div className="flex gap-2 sm:justify-end items-end sm:col-span-2">
            <Btn type="submit" variant="gold">Encaisser</Btn>
          </div>
        </form>
      )}

      {/* Soldes par candidat */}
      <h3 className="font-bold text-[#1a2a4a] mb-2">📋 Situation des candidats</h3>
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
        <table className="w-full text-sm text-left">
          <thead><tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3 font-bold">Candidat</th>
            <th className="px-4 py-3 font-bold">Nature</th>
            <th className="px-4 py-3 font-bold">Disposition</th>
            <th className="px-4 py-3 font-bold">Paiements</th>
            <th className="px-4 py-3 font-bold">Total payé</th>
          </tr></thead>
          <tbody>
            {parCandidat.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="px-4 py-2.5 font-semibold">{c.nom}</td>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${c.nature === "boursier" ? "bg-purple-100 text-purple-800" : "bg-slate-100 text-slate-700"}`}>
                    {c.nature === "boursier" ? "🎓 boursier" : "💰 payant"}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  {c.nature !== "boursier" && (
                    <select className="text-xs font-semibold rounded-lg border border-slate-300 px-2 py-1" value={c.disposition}
                      onChange={(e) => setDispo.mutate({ token, id: c.id, disposition: e.target.value })}>
                      <option value="mensualités">Mensualités</option>
                      <option value="reliquat_unique">Reliquat d'un seul coup</option>
                      <option value="reliquat_nulla_osta">Reliquat au Nulla Osta</option>
                    </select>
                  )}
                </td>
                <td className="px-4 py-2.5">{c.nb}</td>
                <td className="px-4 py-2.5 font-bold">{fmt(c.paye)} FCFA</td>
              </tr>
            ))}
            {parCandidat.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Aucun paiement enregistré.</td></tr>}
          </tbody>
        </table>
      </div>

      <h3 className="font-bold text-[#1a2a4a] mb-2">🧾 Historique des paiements</h3>
      <Table head={["Date", "Candidat", "Nature", "Montant", "En lettres", "Mode", "Réf.", "Actions"]}>
        {(paiements ?? []).map((p) => (
          <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
            <td className="px-4 py-3 text-xs whitespace-nowrap">{p.date}</td>
            <td className="px-4 py-3 font-semibold">{nomCandidat(Number(p.inscriptionId))}</td>
            <td className="px-4 py-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.nature === "reliquat" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>{p.nature}</span>
            </td>
            <td className="px-4 py-3 font-bold whitespace-nowrap">{p.montantChiffres} FCFA</td>
            <td className="px-4 py-3 text-xs italic text-slate-500">{p.montantLettres}</td>
            <td className="px-4 py-3 text-xs">{p.modePaiement}</td>
            <td className="px-4 py-3 text-xs">{p.reference || "—"}</td>
            <td className="px-4 py-3">
              <button className="text-red-600 font-bold text-xs" onClick={() => { if (confirm("Supprimer ce paiement ? (la recette comptable associée n'est pas supprimée automatiquement)")) del.mutate({ token, id: Number(p.id) }); }}>🗑️</button>
            </td>
          </tr>
        ))}
        {(paiements ?? []).length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Aucun paiement.</td></tr>}
      </Table>
    </section>
  );
}
