import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAdmin, Field, Btn, Table, Toggle, inputCls } from "../ui";

const empty = {
  cycleId: null as number | null, label: "", montantChiffres: "",
  montantLettres: "", description: "", estTotal: false, ordre: 0,
};
type Form = typeof empty;

export default function TarifsSection() {
  const { token, refresh } = useAdmin();
  const { data: tarifs } = trpc.admin.listTarifs.useQuery({ token });
  const { data: cycles } = trpc.admin.listCycles.useQuery({ token });
  const create = trpc.admin.createTarif.useMutation({ onSuccess: refresh });
  const update = trpc.admin.updateTarif.useMutation({ onSuccess: refresh });
  const del = trpc.admin.deleteTarif.useMutation({ onSuccess: refresh });

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

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-extrabold text-[#1a2a4a]">Tarifs</h2>
        <Btn variant="gold" onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }}>
          {showForm ? "Fermer" : "+ Nouvelle ligne"}
        </Btn>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 grid sm:grid-cols-2 gap-4">
          <Field label="Libellé"><input required className={inputCls} value={form.label} onChange={(e) => set("label", e.target.value)} placeholder="Inscription" /></Field>
          <Field label="Montant (chiffres)"><input required className={inputCls} value={form.montantChiffres} onChange={(e) => set("montantChiffres", e.target.value)} placeholder="220 000" /></Field>
          <Field label="Montant (lettres / complet)"><input className={inputCls} value={form.montantLettres} onChange={(e) => set("montantLettres", e.target.value)} placeholder="220 000 FCFA" /></Field>
          <Field label="Description"><input className={inputCls} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Frais d'inscription" /></Field>
          <Field label="Ordre"><input type="number" className={inputCls} value={form.ordre} onChange={(e) => set("ordre", e.target.value as any)} /></Field>
          <Field label="Cycle associé">
            <select className={inputCls} value={form.cycleId ?? ""} onChange={(e) => set("cycleId", e.target.value ? Number(e.target.value) : null)}>
              <option value="">Tous les cycles</option>
              {(cycles ?? []).map((c) => <option key={c.id} value={Number(c.id)}>{c.nom}</option>)}
            </select>
          </Field>
          <div className="flex items-center gap-3">
            <Toggle checked={form.estTotal} onChange={(v) => set("estTotal", v)} />
            <span className="text-sm font-semibold text-slate-600">Ligne « Total » (mise en avant dorée)</span>
          </div>
          <div className="flex gap-2 sm:justify-end items-end">
            <Btn type="submit" variant="gold">{editId ? "Enregistrer" : "Créer"}</Btn>
            {editId && <Btn variant="ghost" onClick={() => { setEditId(null); setForm(empty); }}>Annuler</Btn>}
          </div>
        </form>
      )}

      <Table head={["Libellé", "Montant", "En lettres", "Description", "Total ?", "Ordre", "Actions"]}>
        {(tarifs ?? []).map((t) => (
          <tr key={t.id} className="border-t border-slate-100">
            <td className="px-4 py-3 font-bold text-[#1a2a4a]">{t.label}</td>
            <td className="px-4 py-3 font-bold">{t.montantChiffres}</td>
            <td className="px-4 py-3 text-slate-500">{t.montantLettres}</td>
            <td className="px-4 py-3 max-w-64 truncate text-slate-600">{t.description}</td>
            <td className="px-4 py-3">{t.estTotal ? "⭐" : "—"}</td>
            <td className="px-4 py-3">{t.ordre}</td>
            <td className="px-4 py-3 whitespace-nowrap space-x-2">
              <Btn variant="ghost" onClick={() => {
                setEditId(Number(t.id));
                setForm({
                  cycleId: t.cycleId ?? null, label: t.label, montantChiffres: t.montantChiffres,
                  montantLettres: t.montantLettres, description: t.description,
                  estTotal: t.estTotal, ordre: t.ordre,
                });
                setShowForm(true);
              }}>✏️ Modifier</Btn>
              <Btn variant="danger" onClick={() => confirm("Supprimer cette ligne ?") && del.mutate({ token, id: Number(t.id) })}>🗑</Btn>
            </td>
          </tr>
        ))}
      </Table>
      <p className="mt-3 text-xs text-slate-500">
        💡 La devise (FCFA) et l'encadré explicatif du paiement se modifient dans l'onglet « Paramètres » (clés <code>devise</code>, <code>info_titre</code>, <code>info_texte</code>).
      </p>
    </section>
  );
}
