import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAdmin, Field, Btn, Table, Toggle, inputCls } from "../ui";

const empty = {
  nom: "", dateDebut: "", dateFin: "", sessionLabel: "",
  dureeHeures: "120", nbParticipants: 500, lieu: "",
  ville: "Dakar", pays: "Sénégal", actif: true,
};
type Form = typeof empty;

export default function CyclesSection() {
  const { token, refresh } = useAdmin();
  const { data: cycles } = trpc.admin.listCycles.useQuery({ token });
  const create = trpc.admin.createCycle.useMutation({ onSuccess: refresh });
  const update = trpc.admin.updateCycle.useMutation({ onSuccess: refresh });
  const del = trpc.admin.deleteCycle.useMutation({ onSuccess: refresh });

  const [form, setForm] = useState<Form>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const set = (k: keyof Form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, nbParticipants: Number(form.nbParticipants) };
    if (editId) await update.mutateAsync({ token, id: editId, data });
    else await create.mutateAsync({ token, data });
    setForm(empty); setEditId(null); setShowForm(false);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-extrabold text-[#1a2a4a]">Cycles / Sessions</h2>
        <Btn variant="gold" onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }}>
          {showForm ? "Fermer" : "+ Nouveau cycle"}
        </Btn>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 grid sm:grid-cols-2 gap-4">
          <Field label="Nom du cycle"><input required className={inputCls} value={form.nom} onChange={(e) => set("nom", e.target.value)} placeholder="Cycle 2027" /></Field>
          <Field label="Label session (badge)"><input className={inputCls} value={form.sessionLabel} onChange={(e) => set("sessionLabel", e.target.value)} placeholder="Du 01/09 au 30/11/2027 (3 mois)" /></Field>
          <Field label="Date début"><input required className={inputCls} value={form.dateDebut} onChange={(e) => set("dateDebut", e.target.value)} placeholder="01/09/2027" /></Field>
          <Field label="Date fin"><input required className={inputCls} value={form.dateFin} onChange={(e) => set("dateFin", e.target.value)} placeholder="30/11/2027" /></Field>
          <Field label="Durée (heures)"><input required className={inputCls} value={form.dureeHeures} onChange={(e) => set("dureeHeures", e.target.value)} /></Field>
          <Field label="Participants max"><input required type="number" className={inputCls} value={form.nbParticipants} onChange={(e) => set("nbParticipants", e.target.value as any)} /></Field>
          <Field label="Ville"><input className={inputCls} value={form.ville} onChange={(e) => set("ville", e.target.value)} /></Field>
          <Field label="Pays"><input className={inputCls} value={form.pays} onChange={(e) => set("pays", e.target.value)} /></Field>
          <div className="sm:col-span-2">
            <Field label="Lieu / adresse du centre"><input required className={inputCls} value={form.lieu} onChange={(e) => set("lieu", e.target.value)} /></Field>
          </div>
          <div className="flex items-center gap-3">
            <Toggle checked={form.actif} onChange={(v) => set("actif", v)} />
            <span className="text-sm font-semibold text-slate-600">Cycle actif</span>
          </div>
          <div className="flex gap-2 sm:justify-end items-end">
            <Btn type="submit" variant="gold">{editId ? "Enregistrer" : "Créer"}</Btn>
            {editId && <Btn variant="ghost" onClick={() => { setEditId(null); setForm(empty); }}>Annuler</Btn>}
          </div>
        </form>
      )}

      <Table head={["Nom", "Session", "Durée", "Participants", "Lieu", "Actif", "Actions"]}>
        {(cycles ?? []).map((c) => (
          <tr key={c.id} className="border-t border-slate-100">
            <td className="px-4 py-3 font-bold text-[#1a2a4a]">{c.nom}</td>
            <td className="px-4 py-3">{c.sessionLabel || `${c.dateDebut} → ${c.dateFin}`}</td>
            <td className="px-4 py-3">{c.dureeHeures}h</td>
            <td className="px-4 py-3">{c.nbParticipants}</td>
            <td className="px-4 py-3 max-w-56 truncate">{c.lieu}</td>
            <td className="px-4 py-3">
              <Toggle checked={c.actif} onChange={(v) => update.mutate({ token, id: Number(c.id), data: { actif: v } })} />
            </td>
            <td className="px-4 py-3 whitespace-nowrap space-x-2">
              <Btn variant="ghost" onClick={() => {
                setEditId(Number(c.id));
                setForm({
                  nom: c.nom, dateDebut: c.dateDebut, dateFin: c.dateFin,
                  sessionLabel: c.sessionLabel, dureeHeures: c.dureeHeures,
                  nbParticipants: c.nbParticipants, lieu: c.lieu, ville: c.ville, pays: c.pays, actif: c.actif,
                });
                setShowForm(true);
              }}>✏️ Modifier</Btn>
              <Btn variant="danger" onClick={() => confirm("Supprimer ce cycle ?") && del.mutate({ token, id: Number(c.id) })}>🗑</Btn>
            </td>
          </tr>
        ))}
      </Table>
    </section>
  );
}
