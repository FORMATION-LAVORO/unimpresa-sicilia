import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAdmin, Field, Btn, Table, ExportBtn, inputCls } from "../ui";

const empty = {
  travailleurId: null as number | null, inscriptionId: null as number | null,
  nomComplet: "", type: "reussite", entreprise: "", poste: "", ville: "",
  typeContrat: "", dateEvenement: "", salaire: "", statut: "en_cours", notes: "",
};
type Form = typeof empty;

export default function PlacementsSection() {
  const { token, refresh } = useAdmin();
  const { data: placements } = trpc.admin.listPlacements.useQuery({ token });
  const { data: travailleurs } = trpc.admin.listTravailleurs.useQuery({ token });
  const create = trpc.admin.createPlacement.useMutation({ onSuccess: refresh });
  const update = trpc.admin.updatePlacement.useMutation({ onSuccess: refresh });
  const del = trpc.admin.deletePlacement.useMutation({ onSuccess: refresh });

  const [form, setForm] = useState<Form>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filtre, setFiltre] = useState<"tous" | "reussite" | "contrat">("tous");
  const set = (k: keyof Form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await update.mutateAsync({ token, id: editId, data: form });
    else await create.mutateAsync({ token, data: form });
    setForm(empty); setEditId(null); setShowForm(false);
  };

  const pickTravailleur = (id: number | null) => {
    set("travailleurId", id);
    const t = travailleurs?.find((x) => Number(x.id) === id);
    if (t) setForm((f) => ({ ...f, travailleurId: id, nomComplet: `${t.prenom} ${t.nom}`, poste: f.poste || t.metier }));
  };

  const list = (placements ?? []).filter((p) => filtre === "tous" || p.type === filtre);
  const nbReussites = (placements ?? []).filter((p) => p.type === "reussite").length;
  const nbContrats = (placements ?? []).filter((p) => p.type === "contrat").length;

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-extrabold text-[#1a2a4a]">🎯 Réussites & placements en contrats</h2>
        <div className="flex gap-2">
          <ExportBtn dataset="placements" />
          <Btn variant="gold" onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }}>
            {showForm ? "Fermer" : "+ Nouvel événement"}
          </Btn>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="text-xs font-bold text-slate-500 uppercase">🎓 Réussites</div>
          <div className="text-2xl font-extrabold text-[#1a2a4a]">{nbReussites}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="text-xs font-bold text-slate-500 uppercase">📄 Contrats concrétisés</div>
          <div className="text-2xl font-extrabold text-green-700">{nbContrats}</div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 grid sm:grid-cols-2 gap-4">
          <Field label="Travailleur (remplit le nom automatiquement)">
            <select className={inputCls} value={form.travailleurId ?? ""} onChange={(e) => pickTravailleur(e.target.value ? Number(e.target.value) : null)}>
              <option value="">— Saisie libre —</option>
              {(travailleurs ?? []).map((t) => <option key={t.id} value={Number(t.id)}>{t.prenom} {t.nom}</option>)}
            </select>
          </Field>
          <Field label="Nom complet"><input required className={inputCls} value={form.nomComplet} onChange={(e) => set("nomComplet", e.target.value)} /></Field>
          <Field label="Type">
            <select className={inputCls} value={form.type} onChange={(e) => set("type", e.target.value)}>
              <option value="reussite">🎓 Réussite (examen / certification)</option>
              <option value="contrat">📄 Contrat de travail concrétisé</option>
            </select>
          </Field>
          <Field label="Date de l'événement"><input type="date" className={inputCls} value={form.dateEvenement} onChange={(e) => set("dateEvenement", e.target.value)} /></Field>
          {form.type === "contrat" && (
            <>
              <Field label="Entreprise"><input className={inputCls} value={form.entreprise} onChange={(e) => set("entreprise", e.target.value)} /></Field>
              <Field label="Poste"><input className={inputCls} value={form.poste} onChange={(e) => set("poste", e.target.value)} /></Field>
              <Field label="Ville (Italie)"><input className={inputCls} value={form.ville} onChange={(e) => set("ville", e.target.value)} /></Field>
              <Field label="Type de contrat"><input className={inputCls} value={form.typeContrat} onChange={(e) => set("typeContrat", e.target.value)} placeholder="CDI, CDD, saisonnier…" /></Field>
              <Field label="Salaire"><input className={inputCls} value={form.salaire} onChange={(e) => set("salaire", e.target.value)} placeholder="1 300 €/mois" /></Field>
            </>
          )}
          <Field label="Statut">
            <select className={inputCls} value={form.statut} onChange={(e) => set("statut", e.target.value)}>
              {["en_cours", "confirmé", "terminé", "annulé"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Notes"><textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
          <div className="flex gap-2 sm:justify-end items-end sm:col-span-2">
            <Btn type="submit" variant="gold">{editId ? "Enregistrer" : "Créer"}</Btn>
            {editId && <Btn variant="ghost" onClick={() => { setEditId(null); setForm(empty); }}>Annuler</Btn>}
          </div>
        </form>
      )}

      <div className="flex gap-2 mb-3">
        {(["tous", "reussite", "contrat"] as const).map((f) => (
          <Btn key={f} variant={filtre === f ? "gold" : "ghost"} onClick={() => setFiltre(f)}>
            {f === "tous" ? "Tous" : f === "reussite" ? "🎓 Réussites" : "📄 Contrats"}
          </Btn>
        ))}
      </div>

      <Table head={["Nom", "Type", "Entreprise / Poste", "Ville", "Contrat", "Date", "Statut", "Actions"]}>
        {list.map((p) => (
          <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
            <td className="px-4 py-3 font-semibold">{p.nomComplet}</td>
            <td className="px-4 py-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.type === "contrat" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                {p.type === "contrat" ? "📄 contrat" : "🎓 réussite"}
              </span>
            </td>
            <td className="px-4 py-3 text-xs">{p.entreprise ? `${p.entreprise} — ${p.poste}` : p.poste || "—"}</td>
            <td className="px-4 py-3 text-xs">{p.ville || "—"}</td>
            <td className="px-4 py-3 text-xs">{p.typeContrat || "—"}</td>
            <td className="px-4 py-3 text-xs whitespace-nowrap">{p.dateEvenement || "—"}</td>
            <td className="px-4 py-3">
              <select className="text-xs font-bold rounded-lg border border-slate-300 px-2 py-1" value={p.statut}
                onChange={(e) => update.mutate({ token, id: Number(p.id), data: { statut: e.target.value } })}>
                {["en_cours", "confirmé", "terminé", "annulé"].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              <button className="text-blue-600 font-bold text-xs mr-2" onClick={() => { setForm({ ...empty, ...p, travailleurId: p.travailleurId ?? null, inscriptionId: p.inscriptionId ?? null } as Form); setEditId(Number(p.id)); setShowForm(true); }}>✏️</button>
              <button className="text-red-600 font-bold text-xs" onClick={() => { if (confirm("Supprimer ?")) del.mutate({ token, id: Number(p.id) }); }}>🗑️</button>
            </td>
          </tr>
        ))}
        {list.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Aucune réussite ou placement enregistré.</td></tr>}
      </Table>
    </section>
  );
}
