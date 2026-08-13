import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAdmin, Field, Btn, Table, Toggle, inputCls } from "../ui";

const empty = { nom: "", description: "", logo: "", ordre: 0, actif: true };
type Form = typeof empty;

export default function PartenairesSection() {
  const { token, refresh } = useAdmin();
  const { data } = trpc.admin.listPartenaires.useQuery({ token });
  const create = trpc.admin.createPartenaire.useMutation({ onSuccess: refresh });
  const update = trpc.admin.updatePartenaire.useMutation({ onSuccess: refresh });
  const del = trpc.admin.deletePartenaire.useMutation({ onSuccess: refresh });

  const [form, setForm] = useState<Form>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const set = (k: keyof Form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const d = { ...form, ordre: Number(form.ordre) };
    if (editId) await update.mutateAsync({ token, id: editId, data: d });
    else await create.mutateAsync({ token, data: d });
    setForm(empty); setEditId(null); setShowForm(false);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-extrabold text-[#1a2a4a]">Partenaires</h2>
        <Btn variant="gold" onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }}>
          {showForm ? "Fermer" : "+ Nouveau partenaire"}
        </Btn>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 grid sm:grid-cols-2 gap-4">
          <Field label="Nom"><input required className={inputCls} value={form.nom} onChange={(e) => set("nom", e.target.value)} /></Field>
          <Field label="Logo (URL, optionnel)"><input className={inputCls} value={form.logo} onChange={(e) => set("logo", e.target.value)} placeholder="https://…" /></Field>
          <div className="sm:col-span-2">
            <Field label="Description"><textarea rows={2} className={inputCls} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
          </div>
          <Field label="Ordre"><input type="number" className={inputCls} value={form.ordre} onChange={(e) => set("ordre", e.target.value as any)} /></Field>
          <div className="flex items-center gap-3"><Toggle checked={form.actif} onChange={(v) => set("actif", v)} /><span className="text-sm font-semibold text-slate-600">Visible</span></div>
          <div className="flex gap-2 sm:justify-end items-end sm:col-span-2">
            <Btn type="submit" variant="gold">{editId ? "Enregistrer" : "Créer"}</Btn>
            {editId && <Btn variant="ghost" onClick={() => { setEditId(null); setForm(empty); }}>Annuler</Btn>}
          </div>
        </form>
      )}

      <Table head={["Nom", "Description", "Ordre", "Visible", "Actions"]}>
        {(data ?? []).map((p) => (
          <tr key={p.id} className="border-t border-slate-100">
            <td className="px-4 py-3 font-bold text-[#1a2a4a]">{p.nom}</td>
            <td className="px-4 py-3 max-w-96 truncate text-slate-600">{p.description}</td>
            <td className="px-4 py-3">{p.ordre}</td>
            <td className="px-4 py-3"><Toggle checked={p.actif} onChange={(v) => update.mutate({ token, id: Number(p.id), data: { actif: v } })} /></td>
            <td className="px-4 py-3 whitespace-nowrap space-x-2">
              <Btn variant="ghost" onClick={() => { setEditId(Number(p.id)); setForm({ nom: p.nom, description: p.description, logo: p.logo, ordre: p.ordre, actif: p.actif }); setShowForm(true); }}>✏️ Modifier</Btn>
              <Btn variant="danger" onClick={() => confirm("Supprimer ce partenaire ?") && del.mutate({ token, id: Number(p.id) })}>🗑</Btn>
            </td>
          </tr>
        ))}
      </Table>
    </section>
  );
}
