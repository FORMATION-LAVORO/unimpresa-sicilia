import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAdmin, Field, Btn, Table, Toggle, inputCls } from "../ui";

const empty = { icone: "✅", titre: "", description: "", ordre: 0, actif: true };
type Form = typeof empty;

export default function AvantagesSection() {
  const { token, refresh } = useAdmin();
  const { data } = trpc.admin.listAvantages.useQuery({ token });
  const create = trpc.admin.createAvantage.useMutation({ onSuccess: refresh });
  const update = trpc.admin.updateAvantage.useMutation({ onSuccess: refresh });
  const del = trpc.admin.deleteAvantage.useMutation({ onSuccess: refresh });

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
        <h2 className="text-xl font-extrabold text-[#1a2a4a]">Avantages (« Pourquoi nous choisir »)</h2>
        <Btn variant="gold" onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }}>
          {showForm ? "Fermer" : "+ Nouvel avantage"}
        </Btn>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 grid sm:grid-cols-2 gap-4">
          <Field label="Icône (emoji)"><input className={inputCls} value={form.icone} onChange={(e) => set("icone", e.target.value)} /></Field>
          <Field label="Titre"><input required className={inputCls} value={form.titre} onChange={(e) => set("titre", e.target.value)} /></Field>
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

      <Table head={["Icône", "Titre", "Description", "Ordre", "Visible", "Actions"]}>
        {(data ?? []).map((a) => (
          <tr key={a.id} className="border-t border-slate-100">
            <td className="px-4 py-3 text-xl">{a.icone}</td>
            <td className="px-4 py-3 font-bold text-[#1a2a4a]">{a.titre}</td>
            <td className="px-4 py-3 max-w-96 truncate text-slate-600">{a.description}</td>
            <td className="px-4 py-3">{a.ordre}</td>
            <td className="px-4 py-3"><Toggle checked={a.actif} onChange={(v) => update.mutate({ token, id: Number(a.id), data: { actif: v } })} /></td>
            <td className="px-4 py-3 whitespace-nowrap space-x-2">
              <Btn variant="ghost" onClick={() => { setEditId(Number(a.id)); setForm({ icone: a.icone, titre: a.titre, description: a.description, ordre: a.ordre, actif: a.actif }); setShowForm(true); }}>✏️ Modifier</Btn>
              <Btn variant="danger" onClick={() => confirm("Supprimer cet avantage ?") && del.mutate({ token, id: Number(a.id) })}>🗑</Btn>
            </td>
          </tr>
        ))}
      </Table>
    </section>
  );
}
