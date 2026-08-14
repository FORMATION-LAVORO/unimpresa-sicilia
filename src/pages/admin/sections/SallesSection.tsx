import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAdmin, Field, Btn, Toggle, ExportBtn, inputCls } from "../ui";

const empty = {
  nom: "", type: "salle", capacite: 30, occupation: 0,
  equipements: "", localisation: "", seuilAlerte: 90, actif: true,
};
type Form = typeof empty;

export default function SallesSection() {
  const { token, refresh } = useAdmin();
  const { data: salles } = trpc.admin.listSalles.useQuery({ token });
  const create = trpc.admin.createSalle.useMutation({ onSuccess: refresh });
  const update = trpc.admin.updateSalle.useMutation({ onSuccess: refresh });
  const del = trpc.admin.deleteSalle.useMutation({ onSuccess: refresh });

  const [form, setForm] = useState<Form>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const set = (k: keyof Form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, capacite: Number(form.capacite), occupation: Number(form.occupation), seuilAlerte: Number(form.seuilAlerte) };
    if (editId) await update.mutateAsync({ token, id: editId, data });
    else await create.mutateAsync({ token, data });
    setForm(empty); setEditId(null); setShowForm(false);
  };

  const alertes = (salles ?? []).filter((s) => s.capacite > 0 && (s.occupation / s.capacite) * 100 >= s.seuilAlerte);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-extrabold text-[#1a2a4a]">🏫 Salles de classe & amphithéâtres</h2>
        <div className="flex gap-2">
          <ExportBtn dataset="salles" />
          <Btn variant="gold" onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }}>
            {showForm ? "Fermer" : "+ Nouvelle salle"}
          </Btn>
        </div>
      </div>

      {alertes.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <div className="font-bold text-red-800 mb-1">🚨 Alertes de remplissage ({alertes.length})</div>
          {alertes.map((s) => (
            <div key={s.id} className="text-sm text-red-700">
              <b>{s.nom}</b> : {s.occupation}/{s.capacite} places ({Math.round((s.occupation / s.capacite) * 100)}% — seuil {s.seuilAlerte}%)
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 grid sm:grid-cols-2 gap-4">
          <Field label="Nom"><input required className={inputCls} value={form.nom} onChange={(e) => set("nom", e.target.value)} placeholder="Salle A1" /></Field>
          <Field label="Type">
            <select className={inputCls} value={form.type} onChange={(e) => set("type", e.target.value)}>
              <option value="salle">Salle de classe</option><option value="amphithéâtre">Amphithéâtre</option><option value="atelier">Atelier</option><option value="laboratoire">Laboratoire</option>
            </select>
          </Field>
          <Field label="Capacité (places)"><input type="number" min={0} className={inputCls} value={form.capacite} onChange={(e) => set("capacite", e.target.value as any)} /></Field>
          <Field label="Occupation actuelle"><input type="number" min={0} className={inputCls} value={form.occupation} onChange={(e) => set("occupation", e.target.value as any)} /></Field>
          <Field label="Seuil d'alerte (%)"><input type="number" min={1} max={100} className={inputCls} value={form.seuilAlerte} onChange={(e) => set("seuilAlerte", e.target.value as any)} /></Field>
          <Field label="Localisation"><input className={inputCls} value={form.localisation} onChange={(e) => set("localisation", e.target.value)} placeholder="Bâtiment B, 2e étage" /></Field>
          <Field label="Équipements"><textarea className={inputCls} rows={2} value={form.equipements} onChange={(e) => set("equipements", e.target.value)} placeholder="Tableau, projecteur, climatisation…" /></Field>
          <div className="flex items-center gap-3">
            <Toggle checked={form.actif} onChange={(v) => set("actif", v)} />
            <span className="text-sm font-semibold text-slate-600">Salle active</span>
          </div>
          <div className="flex gap-2 sm:justify-end items-end sm:col-span-2">
            <Btn type="submit" variant="gold">{editId ? "Enregistrer" : "Créer"}</Btn>
            {editId && <Btn variant="ghost" onClick={() => { setEditId(null); setForm(empty); }}>Annuler</Btn>}
          </div>
        </form>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(salles ?? []).map((s) => {
          const pct = s.capacite > 0 ? Math.round((s.occupation / s.capacite) * 100) : 0;
          const alerte = pct >= s.seuilAlerte;
          return (
            <div key={s.id} className={`bg-white rounded-xl shadow-sm border p-5 ${alerte ? "border-red-300" : "border-slate-200"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-extrabold text-[#1a2a4a]">{s.type === "amphithéâtre" ? "🏛️" : s.type === "atelier" ? "🔧" : s.type === "laboratoire" ? "🧪" : "🏫"} {s.nom}</div>
                  <div className="text-xs text-slate-500">{s.localisation || s.type}</div>
                </div>
                {alerte && <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-extrabold animate-pulse">🚨 {pct}%</span>}
              </div>
              <div className="mt-3 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${alerte ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : "bg-green-500"}`} style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
              <div className="mt-1.5 text-xs text-slate-500">{s.occupation} / {s.capacite} places ({pct}%) — alerte à {s.seuilAlerte}%</div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-1">
                  <Btn variant="ghost" onClick={() => update.mutate({ token, id: Number(s.id), data: { occupation: Math.max(0, s.occupation - 1) } })}>−1</Btn>
                  <Btn variant="ghost" onClick={() => update.mutate({ token, id: Number(s.id), data: { occupation: s.occupation + 1 } })}>+1</Btn>
                </div>
                <div className="flex gap-2">
                  <button className="text-blue-600 font-bold text-xs" onClick={() => { setForm({ nom: s.nom, type: s.type, capacite: s.capacite, occupation: s.occupation, equipements: s.equipements, localisation: s.localisation, seuilAlerte: s.seuilAlerte, actif: s.actif }); setEditId(Number(s.id)); setShowForm(true); }}>✏️</button>
                  <button className="text-red-600 font-bold text-xs" onClick={() => { if (confirm("Supprimer cette salle ?")) del.mutate({ token, id: Number(s.id) }); }}>🗑️</button>
                </div>
              </div>
            </div>
          );
        })}
        {(salles ?? []).length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
            Aucune salle. Créez votre première salle ou amphithéâtre.
          </div>
        )}
      </div>
    </section>
  );
}
