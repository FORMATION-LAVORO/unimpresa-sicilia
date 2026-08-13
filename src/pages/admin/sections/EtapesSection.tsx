import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAdmin, Field, Btn, Table, inputCls } from "../ui";

const empty = { cycleId: null as number | null, numero: "01", icone: "📌", titre: "", description: "", ordre: 0 };
type Form = typeof empty;

export default function EtapesSection() {
  const { token, refresh } = useAdmin();
  const { data: etapes } = trpc.admin.listEtapes.useQuery({ token });
  const { data: cycles } = trpc.admin.listCycles.useQuery({ token });
  const create = trpc.admin.createEtape.useMutation({ onSuccess: refresh });
  const update = trpc.admin.updateEtape.useMutation({ onSuccess: refresh });
  const del = trpc.admin.deleteEtape.useMutation({ onSuccess: refresh });
  const reorder = trpc.admin.reorderEtapes.useMutation({ onSuccess: refresh });

  const [form, setForm] = useState<Form>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const set = (k: keyof Form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, ordre: Number(form.ordre) };
    if (editId) await update.mutateAsync({ token, id: editId, data });
    else await create.mutateAsync({ token, data });
    setForm(empty); setEditId(null); setShowForm(false);
  };

  const move = (index: number, dir: -1 | 1) => {
    if (!etapes) return;
    const ids = etapes.map((e) => Number(e.id));
    const j = index + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[index], ids[j]] = [ids[j], ids[index]];
    reorder.mutate({ token, ids });
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-extrabold text-[#1a2a4a]">Déroulement (timeline)</h2>
        <Btn variant="gold" onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }}>
          {showForm ? "Fermer" : "+ Nouvelle étape"}
        </Btn>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 grid sm:grid-cols-2 gap-4">
          <Field label="Numéro"><input required className={inputCls} value={form.numero} onChange={(e) => set("numero", e.target.value)} placeholder="02" /></Field>
          <Field label="Icône (emoji)"><input className={inputCls} value={form.icone} onChange={(e) => set("icone", e.target.value)} /></Field>
          <Field label="Titre"><input required className={inputCls} value={form.titre} onChange={(e) => set("titre", e.target.value)} /></Field>
          <Field label="Cycle associé">
            <select className={inputCls} value={form.cycleId ?? ""} onChange={(e) => set("cycleId", e.target.value ? Number(e.target.value) : null)}>
              <option value="">Tous les cycles</option>
              {(cycles ?? []).map((c) => <option key={c.id} value={Number(c.id)}>{c.nom}</option>)}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description"><textarea required rows={3} className={inputCls} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
          </div>
          <div className="flex gap-2 sm:justify-end items-end sm:col-span-2">
            <Btn type="submit" variant="gold">{editId ? "Enregistrer" : "Créer"}</Btn>
            {editId && <Btn variant="ghost" onClick={() => { setEditId(null); setForm(empty); }}>Annuler</Btn>}
          </div>
        </form>
      )}

      <Table head={["Ordre", "N°", "Icône", "Titre", "Description", "Actions"]}>
        {(etapes ?? []).map((e, i) => (
          <tr key={e.id} className="border-t border-slate-100">
            <td className="px-4 py-3 whitespace-nowrap">
              <button className="px-2 disabled:opacity-30" disabled={i === 0} onClick={() => move(i, -1)}>⬆️</button>
              <button className="px-2 disabled:opacity-30" disabled={i === (etapes?.length ?? 0) - 1} onClick={() => move(i, 1)}>⬇️</button>
            </td>
            <td className="px-4 py-3">
              <span className="inline-flex w-8 h-8 rounded-full bg-[#c9a227] text-[#0f1f2e] font-extrabold text-xs items-center justify-center">{e.numero}</span>
            </td>
            <td className="px-4 py-3 text-xl">{e.icone}</td>
            <td className="px-4 py-3 font-bold text-[#1a2a4a] whitespace-nowrap">{e.titre}</td>
            <td className="px-4 py-3 max-w-80 truncate text-slate-600">{e.description}</td>
            <td className="px-4 py-3 whitespace-nowrap space-x-2">
              <Btn variant="ghost" onClick={() => {
                setEditId(Number(e.id));
                setForm({ cycleId: e.cycleId ?? null, numero: e.numero, icone: e.icone, titre: e.titre, description: e.description, ordre: e.ordre });
                setShowForm(true);
              }}>✏️ Modifier</Btn>
              <Btn variant="danger" onClick={() => confirm("Supprimer cette étape ?") && del.mutate({ token, id: Number(e.id) })}>🗑</Btn>
            </td>
          </tr>
        ))}
      </Table>
    </section>
  );
}
