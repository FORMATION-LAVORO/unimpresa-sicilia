import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAdmin, Field, Btn, Table, ExportBtn, inputCls } from "../ui";

const empty = {
  inscriptionId: 0, travailleurId: null as number | null,
  entreprise: "", poste: "", localite: "", salaire: "", typeContrat: "",
  datePrecontrat: "", dateNullaOsta: "", dateDepotVisa: "", resultatVisa: "",
  dateContrat: "", statut: "precontrat", notes: "",
};
type Form = typeof empty;

const STATUTS = ["precontrat", "nulla_osta_demandé", "nulla_osta_obtenu", "visa_déposé", "visa_accordé", "visa_refusé", "contrat_signé"];
const STATUT_LABEL: Record<string, string> = {
  precontrat: "📝 Précontrat",
  nulla_osta_demandé: "📨 Nulla Osta demandé",
  nulla_osta_obtenu: "✅ Nulla Osta obtenu",
  visa_déposé: "🛂 Visa déposé (Ambassade)",
  visa_accordé: "🟢 Visa accordé",
  visa_refusé: "🔴 Visa refusé",
  contrat_signé: "📄 Contrat signé",
};

export default function VisaSection() {
  const { token, refresh } = useAdmin();
  const { data: etapes } = trpc.admin.listEtapesVisa.useQuery({ token });
  const { data: stats } = trpc.admin.statsVisa.useQuery({ token });
  const { data: inscriptions } = trpc.admin.listInscriptions.useQuery({ token });
  const create = trpc.admin.createEtapeVisa.useMutation({ onSuccess: refresh });
  const update = trpc.admin.updateEtapeVisa.useMutation({ onSuccess: refresh });
  const del = trpc.admin.deleteEtapeVisa.useMutation({ onSuccess: refresh });

  const [form, setForm] = useState<Form>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const set = (k: keyof Form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.inscriptionId) return alert("Choisissez un candidat");
    if (editId) await update.mutateAsync({ token, id: editId, data: form });
    else await create.mutateAsync({ token, data: form });
    setForm(empty); setEditId(null); setShowForm(false);
  };

  const nomCandidat = (id: number) => {
    const i = inscriptions?.find((x) => Number(x.id) === id);
    return i ? `${i.prenom} ${i.nom}` : `#${id}`;
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-extrabold text-[#1a2a4a]">🛂 Visa, Nulla Osta & contrats (Italie)</h2>
        <div className="flex gap-2">
          <ExportBtn dataset="placements" label="Exporter" />
          <Btn variant="gold" onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }}>
            {showForm ? "Fermer" : "+ Nouveau dossier visa"}
          </Btn>
        </div>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Parcours : <b>précontrat</b> (trouvé en matching) → <b>Nulla Osta</b> du MLPS italien → <b>dépôt visa</b> à l'Ambassade d'Italie à Dakar → <b>contrat signé</b>.
      </p>

      {/* Taux de réussite */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="text-xs font-bold text-slate-500 uppercase">Précontrats</div>
            <div className="text-2xl font-extrabold text-[#1a2a4a]">{stats.precontrats}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="text-xs font-bold text-slate-500 uppercase">Nulla Osta obtenus</div>
            <div className="text-2xl font-extrabold text-blue-700">{stats.nullaOsta}</div>
            <div className="text-xs text-slate-400">{stats.tauxNullaOsta}% des précontrats</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="text-xs font-bold text-slate-500 uppercase">Visas accordés</div>
            <div className="text-2xl font-extrabold text-emerald-700">{stats.visasObtenus}</div>
            <div className="text-xs text-slate-400">{stats.tauxVisa}% des Nulla Osta</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border-2 border-[#c9a227] p-4">
            <div className="text-xs font-bold text-slate-500 uppercase">Contrats signés</div>
            <div className="text-2xl font-extrabold text-green-700">{stats.contrats}</div>
            <div className="text-xs font-bold text-[#8a6d1a]">Taux contrats / Nulla Osta : {stats.tauxContratVsNullaOsta}%</div>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 grid sm:grid-cols-2 gap-4">
          <Field label="Candidat">
            <select required className={inputCls} value={form.inscriptionId || ""} onChange={(e) => set("inscriptionId", Number(e.target.value))}>
              <option value="">— Choisir —</option>
              {(inscriptions ?? []).map((i) => <option key={i.id} value={Number(i.id)}>{i.prenom} {i.nom} — {i.metierChoisi}</option>)}
            </select>
          </Field>
          <Field label="Étape atteinte">
            <select className={inputCls} value={form.statut} onChange={(e) => set("statut", e.target.value)}>
              {STATUTS.map((s) => <option key={s} value={s}>{STATUT_LABEL[s]}</option>)}
            </select>
          </Field>
          <Field label="Entreprise (Italie)"><input className={inputCls} value={form.entreprise} onChange={(e) => set("entreprise", e.target.value)} /></Field>
          <Field label="Poste"><input className={inputCls} value={form.poste} onChange={(e) => set("poste", e.target.value)} /></Field>
          <Field label="Localité (Italie)"><input className={inputCls} value={form.localite} onChange={(e) => set("localite", e.target.value)} placeholder="Palerme, Sicile" /></Field>
          <Field label="Type de contrat"><input className={inputCls} value={form.typeContrat} onChange={(e) => set("typeContrat", e.target.value)} placeholder="CDI, CDD, saisonnier…" /></Field>
          <Field label="Salaire"><input className={inputCls} value={form.salaire} onChange={(e) => set("salaire", e.target.value)} placeholder="1 300 €/mois" /></Field>
          <Field label="Date du précontrat"><input type="date" className={inputCls} value={form.datePrecontrat} onChange={(e) => set("datePrecontrat", e.target.value)} /></Field>
          <Field label="Date d'obtention du Nulla Osta"><input type="date" className={inputCls} value={form.dateNullaOsta} onChange={(e) => set("dateNullaOsta", e.target.value)} /></Field>
          <Field label="Date de dépôt du visa (Ambassade)"><input type="date" className={inputCls} value={form.dateDepotVisa} onChange={(e) => set("dateDepotVisa", e.target.value)} /></Field>
          <Field label="Résultat du visa">
            <select className={inputCls} value={form.resultatVisa} onChange={(e) => set("resultatVisa", e.target.value)}>
              <option value="">— en attente —</option><option value="accordé">accordé</option><option value="refusé">refusé</option>
            </select>
          </Field>
          <Field label="Date de signature du contrat"><input type="date" className={inputCls} value={form.dateContrat} onChange={(e) => set("dateContrat", e.target.value)} /></Field>
          <Field label="Notes"><textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
          <div className="flex gap-2 sm:justify-end items-end sm:col-span-2">
            <Btn type="submit" variant="gold">{editId ? "Enregistrer" : "Créer"}</Btn>
            {editId && <Btn variant="ghost" onClick={() => { setEditId(null); setForm(empty); }}>Annuler</Btn>}
          </div>
        </form>
      )}

      <Table head={["Candidat", "Entreprise / poste", "Localité", "Salaire / contrat", "Précontrat", "Nulla Osta", "Visa", "Étape", "Actions"]}>
        {(etapes ?? []).map((v) => (
          <tr key={v.id} className="border-t border-slate-100 hover:bg-slate-50">
            <td className="px-4 py-3 font-semibold whitespace-nowrap">{nomCandidat(Number(v.inscriptionId))}</td>
            <td className="px-4 py-3 text-xs">{v.entreprise ? `${v.entreprise}${v.poste ? ` — ${v.poste}` : ""}` : "—"}</td>
            <td className="px-4 py-3 text-xs">{v.localite || "—"}</td>
            <td className="px-4 py-3 text-xs">{v.salaire || "—"}{v.typeContrat && <div className="text-slate-400">{v.typeContrat}</div>}</td>
            <td className="px-4 py-3 text-xs whitespace-nowrap">{v.datePrecontrat || "—"}</td>
            <td className="px-4 py-3 text-xs whitespace-nowrap">{v.dateNullaOsta ? <span className="font-bold text-blue-700">{v.dateNullaOsta}</span> : "—"}</td>
            <td className="px-4 py-3 text-xs whitespace-nowrap">
              {v.dateDepotVisa ?? ""}
              {v.resultatVisa && (
                <div className={`font-bold ${v.resultatVisa === "accordé" ? "text-green-700" : "text-red-700"}`}>{v.resultatVisa}</div>
              )}
            </td>
            <td className="px-4 py-3">
              <select className="text-xs font-bold rounded-lg border border-slate-300 px-2 py-1" value={v.statut}
                onChange={(e) => update.mutate({ token, id: Number(v.id), data: { statut: e.target.value } })}>
                {STATUTS.map((s) => <option key={s} value={s}>{STATUT_LABEL[s]}</option>)}
              </select>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              <button className="text-blue-600 font-bold text-xs mr-2" onClick={() => { setForm({ ...empty, ...v, inscriptionId: Number(v.inscriptionId), travailleurId: v.travailleurId ?? null } as Form); setEditId(Number(v.id)); setShowForm(true); }}>✏️</button>
              <button className="text-red-600 font-bold text-xs" onClick={() => { if (confirm("Supprimer ce dossier visa ?")) del.mutate({ token, id: Number(v.id) }); }}>🗑️</button>
            </td>
          </tr>
        ))}
        {(etapes ?? []).length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">Aucun dossier visa pour le moment.</td></tr>}
      </Table>
    </section>
  );
}
