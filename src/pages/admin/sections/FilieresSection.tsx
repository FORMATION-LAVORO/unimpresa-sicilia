import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAdmin, Field, Btn, Table, Toggle, inputCls } from "../ui";

const empty = {
  cycleId: null as number | null, titre: "", description: "",
  dureeHeures: "120h", nbMetiers: 1, icone: "📚", badge: "", metiers: "", ordre: 0, actif: true,
};
type Form = typeof empty;

export default function FilieresSection() {
  const { token, refresh } = useAdmin();
  const { data: filieres } = trpc.admin.listFilieres.useQuery({ token });
  const { data: cycles } = trpc.admin.listCycles.useQuery({ token });
  const create = trpc.admin.createFiliere.useMutation({ onSuccess: refresh });
  const update = trpc.admin.updateFiliere.useMutation({ onSuccess: refresh });
  const del = trpc.admin.deleteFiliere.useMutation({ onSuccess: refresh });

  const [form, setForm] = useState<Form>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const set = (k: keyof Form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, nbMetiers: Number(form.nbMetiers), ordre: Number(form.ordre) };
    if (editId) await update.mutateAsync({ token, id: editId, data });
    else await create.mutateAsync({ token, data });
    setForm(empty); setEditId(null); setShowForm(false);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-extrabold text-[#1a2a4a]">Filières / Secteurs</h2>
        <Btn variant="gold" onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }}>
          {showForm ? "Fermer" : "+ Nouvelle filière"}
        </Btn>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 grid sm:grid-cols-2 gap-4">
          <Field label="Titre"><input required className={inputCls} value={form.titre} onChange={(e) => set("titre", e.target.value)} /></Field>
          <Field label="Icône (emoji)"><input className={inputCls} value={form.icone} onChange={(e) => set("icone", e.target.value)} placeholder="🏗️" /></Field>
          <div className="sm:col-span-2">
            <Field label="Description"><textarea required rows={3} className={inputCls} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
          </div>
          <Field label="Durée"><input required className={inputCls} value={form.dureeHeures} onChange={(e) => set("dureeHeures", e.target.value)} placeholder="120h" /></Field>
          <Field label="Nombre de métiers"><input required type="number" className={inputCls} value={form.nbMetiers} onChange={(e) => set("nbMetiers", e.target.value as any)} /></Field>
          <Field label="Badge (optionnel)"><input className={inputCls} value={form.badge} onChange={(e) => set("badge", e.target.value)} placeholder="Formation en cours" /></Field>
          <div className="sm:col-span-2">
            <Field label="Métiers détaillés (un par ligne — utilisés dans le formulaire d'inscription)">
              <textarea
                rows={4}
                className={inputCls}
                value={(() => { try { return (JSON.parse(form.metiers || "[]") as string[]).join("\n"); } catch { return form.metiers; } })()}
                onChange={(e) => set("metiers", JSON.stringify(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean)))}
                placeholder={"Maçon\nFerrailleur\nÉlectricien bâtiment"}
              />
            </Field>
          </div>
          <Field label="Ordre d'affichage"><input type="number" className={inputCls} value={form.ordre} onChange={(e) => set("ordre", e.target.value as any)} /></Field>
          <Field label="Cycle associé">
            <select className={inputCls} value={form.cycleId ?? ""} onChange={(e) => set("cycleId", e.target.value ? Number(e.target.value) : null)}>
              <option value="">Tous les cycles</option>
              {(cycles ?? []).map((c) => <option key={c.id} value={Number(c.id)}>{c.nom}</option>)}
            </select>
          </Field>
          <div className="flex items-center gap-3">
            <Toggle checked={form.actif} onChange={(v) => set("actif", v)} />
            <span className="text-sm font-semibold text-slate-600">Filière active</span>
          </div>
          <div className="flex gap-2 sm:justify-end items-end sm:col-span-2">
            <Btn type="submit" variant="gold">{editId ? "Enregistrer" : "Créer"}</Btn>
            {editId && <Btn variant="ghost" onClick={() => { setEditId(null); setForm(empty); }}>Annuler</Btn>}
          </div>
        </form>
      )}

      <Table head={["Icône", "Titre", "Description", "Durée", "Métiers", "Badge", "Ordre", "Active", "Actions"]}>
        {(filieres ?? []).map((f) => (
          <tr key={f.id} className="border-t border-slate-100">
            <td className="px-4 py-3 text-2xl">{f.icone}</td>
            <td className="px-4 py-3 font-bold text-[#1a2a4a] whitespace-nowrap">{f.titre}</td>
            <td className="px-4 py-3 max-w-72 truncate text-slate-600">{f.description}</td>
            <td className="px-4 py-3">{f.dureeHeures}</td>
            <td className="px-4 py-3">{f.nbMetiers}</td>
            <td className="px-4 py-3">{f.badge && <span className="text-xs bg-[#c9a227]/20 text-[#8a6d1a] font-bold px-2 py-1 rounded-full">{f.badge}</span>}</td>
            <td className="px-4 py-3">{f.ordre}</td>
            <td className="px-4 py-3"><Toggle checked={f.actif} onChange={(v) => update.mutate({ token, id: Number(f.id), data: { actif: v } })} /></td>
            <td className="px-4 py-3 whitespace-nowrap space-x-2">
              <Btn variant="ghost" onClick={() => {
                setEditId(Number(f.id));
                setForm({
                  cycleId: f.cycleId ?? null, titre: f.titre, description: f.description,
                  dureeHeures: f.dureeHeures, nbMetiers: f.nbMetiers, icone: f.icone,
                  badge: f.badge, metiers: f.metiers ?? "", ordre: f.ordre, actif: f.actif,
                });
                setShowForm(true);
              }}>✏️ Modifier</Btn>
              <Btn variant="danger" onClick={() => confirm("Supprimer cette filière ?") && del.mutate({ token, id: Number(f.id) })}>🗑</Btn>
            </td>
          </tr>
        ))}
      </Table>
    </section>
  );
}
