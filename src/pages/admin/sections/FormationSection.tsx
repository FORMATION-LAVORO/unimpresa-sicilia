import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAdmin, Field, Btn, Table, inputCls } from "../ui";

const emptyModule = { cycleId: null as number | null, filiereId: null as number | null, titre: "", dureeHeures: 0, ordre: 0, actif: true };

export default function FormationSection() {
  const { token, refresh } = useAdmin();
  const { data: mods } = trpc.admin.listModules.useQuery({ token });
  const { data: cycles } = trpc.admin.listCycles.useQuery({ token });
  const { data: filieres } = trpc.admin.listFilieres.useQuery({ token });
  const { data: tableau } = trpc.admin.tableauProgression.useQuery({ token });
  const createModule = trpc.admin.createModule.useMutation({ onSuccess: refresh });
  const delModule = trpc.admin.deleteModule.useMutation({ onSuccess: refresh });
  const setProg = trpc.admin.setProgression.useMutation({ onSuccess: refresh });

  const [form, setForm] = useState(emptyModule);
  const [showForm, setShowForm] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createModule.mutateAsync({ token, data: { ...form, dureeHeures: Number(form.dureeHeures), ordre: Number(form.ordre) } });
    setForm(emptyModule); setShowForm(false);
  };

  const cycle = cycles?.[0];
  const totalHeures = (mods ?? []).reduce((s, m) => s + m.dureeHeures, 0);

  const progOf = (candId: number, modId: number) =>
    tableau?.candidats.find((c) => c.id === candId)?.parModule.find((p) => Number(p.moduleId) === modId);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-extrabold text-[#1a2a4a]">📖 Suivi de formation — modules & heures</h2>
        <Btn variant="gold" onClick={() => setShowForm(!showForm)}>{showForm ? "Fermer" : "+ Nouveau module"}</Btn>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Le programme {cycle ? `de ${cycle.dureeHeures} heures ` : ""}se découpe en modules. La somme des modules : <b>{totalHeures} h</b>
        {cycle && Number(cycle.dureeHeures) !== totalHeures && (
          <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
            ⚠️ ne correspond pas aux {cycle.dureeHeures} h du cycle
          </span>
        )}
        {cycle && Number(cycle.dureeHeures) === totalHeures && totalHeures > 0 && (
          <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-bold">✅ cohérent avec le cycle</span>
        )}
      </p>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 grid sm:grid-cols-2 gap-4">
          <Field label="Titre du module"><input required className={inputCls} value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} placeholder="Italien niveau A1, Technique de maçonnerie…" /></Field>
          <Field label="Durée (heures)"><input required type="number" min={0} className={inputCls} value={form.dureeHeures} onChange={(e) => setForm({ ...form, dureeHeures: e.target.value as any })} /></Field>
          <Field label="Filière (vide = tous)">
            <select className={inputCls} value={form.filiereId ?? ""} onChange={(e) => setForm({ ...form, filiereId: e.target.value ? Number(e.target.value) : null })}>
              <option value="">Toutes les filières</option>
              {(filieres ?? []).map((f) => <option key={f.id} value={Number(f.id)}>{f.titre}</option>)}
            </select>
          </Field>
          <Field label="Ordre"><input type="number" className={inputCls} value={form.ordre} onChange={(e) => setForm({ ...form, ordre: e.target.value as any })} /></Field>
          <div className="flex gap-2 sm:justify-end items-end sm:col-span-2">
            <Btn type="submit" variant="gold">Créer le module</Btn>
          </div>
        </form>
      )}

      {/* Liste des modules */}
      <h3 className="font-bold text-[#1a2a4a] mb-2">Modules du programme</h3>
      <Table head={["N°", "Module", "Heures", "Filière", "Actions"]}>
        {(mods ?? []).map((m, idx) => (
          <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50">
            <td className="px-4 py-3 font-bold text-[#8a6d1a]">{idx + 1}</td>
            <td className="px-4 py-3 font-semibold">{m.titre}</td>
            <td className="px-4 py-3 font-bold">{m.dureeHeures} h</td>
            <td className="px-4 py-3 text-xs">{filieres?.find((f) => Number(f.id) === Number(m.filiereId))?.titre ?? "Toutes"}</td>
            <td className="px-4 py-3">
              <button className="text-red-600 font-bold text-xs" onClick={() => { if (confirm("Supprimer ce module ?")) delModule.mutate({ token, id: Number(m.id) }); }}>🗑️</button>
            </td>
          </tr>
        ))}
        {(mods ?? []).length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Aucun module. Découpez le programme en modules horaires.</td></tr>}
      </Table>

      {/* Progression des candidats */}
      <h3 className="font-bold text-[#1a2a4a] mt-6 mb-2">Progression des candidats (admis / confirmés)</h3>
      <div className="space-y-3">
        {(tableau?.candidats ?? []).map((c) => {
          const totalModuleHeures = (mods ?? []).reduce((s, m) => s + m.dureeHeures, 0) || Number(cycle?.dureeHeures ?? 120);
          const pct = totalModuleHeures > 0 ? Math.min(100, Math.round((c.heuresFaites / totalModuleHeures) * 100)) : 0;
          return (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-[#1a2a4a]">{c.nom}</span>
                  <span className="text-xs text-slate-400 ml-2">{c.filiere}</span>
                </div>
                <span className="text-sm font-bold">{c.heuresFaites} / {totalModuleHeures} h ({pct}%)</span>
              </div>
              <div className="mt-2 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${pct >= 100 ? "bg-green-500" : "bg-[#c9a227]"}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(mods ?? []).map((m, idx) => {
                  const p = progOf(c.id, Number(m.id));
                  const valide = p?.statut === "validé";
                  return (
                    <button
                      key={m.id}
                      title={`${m.titre} — ${p?.heuresFaites ?? 0}/${m.dureeHeures} h — cliquer pour valider le module (${m.dureeHeures} h)`}
                      onClick={() => {
                        if (valide) {
                          setProg.mutate({ token, data: { inscriptionId: c.id, moduleId: Number(m.id), heuresFaites: 0, statut: "en_cours", dateValidation: "" } });
                        } else {
                          setProg.mutate({ token, data: { inscriptionId: c.id, moduleId: Number(m.id), heuresFaites: m.dureeHeures, statut: "validé", dateValidation: new Date().toISOString().slice(0, 10) } });
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${valide ? "bg-green-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                    >
                      {valide ? "✅" : `M${idx + 1}`} {m.titre.length > 18 ? m.titre.slice(0, 18) + "…" : m.titre}
                    </button>
                  );
                })}
                {(mods ?? []).length === 0 && <span className="text-xs text-slate-400">Créez d'abord des modules.</span>}
              </div>
            </div>
          );
        })}
        {(tableau?.candidats ?? []).length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">Aucun candidat admis ou confirmé pour le moment.</div>
        )}
      </div>
    </section>
  );
}
