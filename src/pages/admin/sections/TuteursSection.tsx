import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAdmin, Field, Btn, Table, ExportBtn, inputCls } from "../ui";

const empty = {
  nom: "", prenom: "", role: "enseignant", specialite: "",
  filiereId: null as number | null, telephone: "", email: "",
  langues: "", statut: "actif", notes: "",
};
type Form = typeof empty;

export default function TuteursSection() {
  const { token, refresh } = useAdmin();
  const { data: tuteurs } = trpc.admin.listTuteurs.useQuery({ token });
  const { data: filieres } = trpc.admin.listFilieres.useQuery({ token });
  const create = trpc.admin.createTuteur.useMutation({ onSuccess: refresh });
  const update = trpc.admin.updateTuteur.useMutation({ onSuccess: refresh });
  const del = trpc.admin.deleteTuteur.useMutation({ onSuccess: refresh });

  const [form, setForm] = useState<Form>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const set = (k: keyof Form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await update.mutateAsync({ token, id: editId, data: form });
    else await create.mutateAsync({ token, data: form });
    setForm(empty); setEditId(null); setShowForm(false);
  };

  const filiereNom = (id: number | null) => filieres?.find((f) => Number(f.id) === id)?.titre ?? "—";

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-extrabold text-[#1a2a4a]">👨‍🏫 Tuteurs & enseignants</h2>
        <div className="flex gap-2">
          <ExportBtn dataset="tuteurs" />
          <Btn variant="gold" onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }}>
            {showForm ? "Fermer" : "+ Nouveau membre"}
          </Btn>
        </div>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 grid sm:grid-cols-2 gap-4">
          <Field label="Nom"><input required className={inputCls} value={form.nom} onChange={(e) => set("nom", e.target.value)} /></Field>
          <Field label="Prénom"><input required className={inputCls} value={form.prenom} onChange={(e) => set("prenom", e.target.value)} /></Field>
          <Field label="Rôle">
            <select className={inputCls} value={form.role} onChange={(e) => set("role", e.target.value)}>
              <option value="enseignant">Enseignant</option><option value="tuteur">Tuteur</option><option value="coordinateur">Coordinateur</option>
            </select>
          </Field>
          <Field label="Spécialité"><input className={inputCls} value={form.specialite} onChange={(e) => set("specialite", e.target.value)} placeholder="Langue italienne, maçonnerie…" /></Field>
          <Field label="Filière rattachée">
            <select className={inputCls} value={form.filiereId ?? ""} onChange={(e) => set("filiereId", e.target.value ? Number(e.target.value) : null)}>
              <option value="">—</option>
              {(filieres ?? []).map((f) => <option key={f.id} value={Number(f.id)}>{f.titre}</option>)}
            </select>
          </Field>
          <Field label="Téléphone"><input className={inputCls} value={form.telephone} onChange={(e) => set("telephone", e.target.value)} /></Field>
          <Field label="Email"><input className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field label="Langues parlées"><input className={inputCls} value={form.langues} onChange={(e) => set("langues", e.target.value)} placeholder="Italien, français, wolof…" /></Field>
          <Field label="Statut">
            <select className={inputCls} value={form.statut} onChange={(e) => set("statut", e.target.value)}>
              <option value="actif">actif</option><option value="congé">congé</option><option value="inactif">inactif</option>
            </select>
          </Field>
          <Field label="Notes"><textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
          <div className="flex gap-2 sm:justify-end items-end sm:col-span-2">
            <Btn type="submit" variant="gold">{editId ? "Enregistrer" : "Créer"}</Btn>
            {editId && <Btn variant="ghost" onClick={() => { setEditId(null); setForm(empty); }}>Annuler</Btn>}
          </div>
        </form>
      )}

      <Table head={["Nom", "Rôle", "Spécialité", "Filière", "Langues", "Contact", "Statut", "Actions"]}>
        {(tuteurs ?? []).map((t) => (
          <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50">
            <td className="px-4 py-3 font-semibold">{t.prenom} {t.nom}</td>
            <td className="px-4 py-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${t.role === "tuteur" ? "bg-purple-100 text-purple-800" : t.role === "coordinateur" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>{t.role}</span>
            </td>
            <td className="px-4 py-3 text-xs">{t.specialite || "—"}</td>
            <td className="px-4 py-3 text-xs">{filiereNom(t.filiereId)}</td>
            <td className="px-4 py-3 text-xs">{t.langues || "—"}</td>
            <td className="px-4 py-3 text-xs">{t.telephone}{t.email && <div className="text-slate-400">{t.email}</div>}</td>
            <td className="px-4 py-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${t.statut === "actif" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>{t.statut}</span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              <button className="text-blue-600 font-bold text-xs mr-2" onClick={() => { setForm({ ...empty, ...t, filiereId: t.filiereId ?? null } as Form); setEditId(Number(t.id)); setShowForm(true); }}>✏️</button>
              <button className="text-red-600 font-bold text-xs" onClick={() => { if (confirm("Supprimer ce membre ?")) del.mutate({ token, id: Number(t.id) }); }}>🗑️</button>
            </td>
          </tr>
        ))}
        {(tuteurs ?? []).length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Aucun tuteur ou enseignant.</td></tr>}
      </Table>
    </section>
  );
}
