import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAdmin, Field, Btn, Table, ExportBtn, inputCls } from "../ui";

const empty = {
  inscriptionId: null as number | null,
  nom: "", prenom: "", dateNaissance: "", age: 0, sexe: "",
  situationFamiliale: "", qualification: "",
  telephone: "", email: "", profession: "", competences: "",
  experienceAnnees: 0, niveauItalien: "débutant", autresLangues: "",
  filiereId: null as number | null, metier: "", statut: "en_formation", notes: "",
};
type Form = typeof empty;

const NIVEAUX = ["débutant", "intermédiaire", "courant", "avancé"];
const STATUTS = ["en_formation", "disponible", "en_matching", "placé", "inactif"];

export default function TravailleursSection() {
  const { token, refresh } = useAdmin();
  const { data: travailleurs } = trpc.admin.listTravailleurs.useQuery({ token });
  const { data: filieres } = trpc.admin.listFilieres.useQuery({ token });
  const create = trpc.admin.createTravailleur.useMutation({ onSuccess: refresh });
  const update = trpc.admin.updateTravailleur.useMutation({ onSuccess: refresh });
  const del = trpc.admin.deleteTravailleur.useMutation({ onSuccess: refresh });

  const [form, setForm] = useState<Form>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const set = (k: keyof Form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, age: Number(form.age), experienceAnnees: Number(form.experienceAnnees) };
    if (editId) await update.mutateAsync({ token, id: editId, data });
    else await create.mutateAsync({ token, data });
    setForm(empty); setEditId(null); setShowForm(false);
  };

  const list = (travailleurs ?? []).filter((t) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return [t.nom, t.prenom, t.profession, t.metier, t.autresLangues, t.competences]
      .some((v) => (v ?? "").toLowerCase().includes(s));
  });

  const filiereNom = (id: number | null) => filieres?.find((f) => Number(f.id) === id)?.titre ?? "—";

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-extrabold text-[#1a2a4a]">👷 Travailleurs — profils professionnels</h2>
        <div className="flex gap-2">
          <ExportBtn dataset="travailleurs" />
          <Btn variant="gold" onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }}>
            {showForm ? "Fermer" : "+ Nouveau travailleur"}
          </Btn>
        </div>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 grid sm:grid-cols-2 gap-4">
          <Field label="Nom"><input required className={inputCls} value={form.nom} onChange={(e) => set("nom", e.target.value)} /></Field>
          <Field label="Prénom"><input required className={inputCls} value={form.prenom} onChange={(e) => set("prenom", e.target.value)} /></Field>
          <Field label="Date de naissance"><input className={inputCls} value={form.dateNaissance} onChange={(e) => set("dateNaissance", e.target.value)} placeholder="15/03/1998" /></Field>
          <Field label="Âge"><input type="number" min={0} className={inputCls} value={form.age} onChange={(e) => set("age", e.target.value as any)} /></Field>
          <Field label="Sexe">
            <select className={inputCls} value={form.sexe} onChange={(e) => set("sexe", e.target.value)}>
              <option value="">—</option><option value="M">Masculin</option><option value="F">Féminin</option>
            </select>
          </Field>
          <Field label="Situation familiale">
            <select className={inputCls} value={form.situationFamiliale} onChange={(e) => set("situationFamiliale", e.target.value)}>
              <option value="">—</option><option value="célibataire">Célibataire</option><option value="marié(e)">Marié(e)</option><option value="divorcé(e)">Divorcé(e)</option><option value="veuf/veuve">Veuf/Veuve</option>
            </select>
          </Field>
          <Field label="Qualification / diplôme"><input className={inputCls} value={form.qualification} onChange={(e) => set("qualification", e.target.value)} placeholder="CAP, BT, certificat…" /></Field>
          <Field label="Téléphone"><input className={inputCls} value={form.telephone} onChange={(e) => set("telephone", e.target.value)} /></Field>
          <Field label="Email"><input className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field label="Profession actuelle"><input className={inputCls} value={form.profession} onChange={(e) => set("profession", e.target.value)} /></Field>
          <Field label="Métier visé"><input className={inputCls} value={form.metier} onChange={(e) => set("metier", e.target.value)} placeholder="Maçon, Pizzaiolo…" /></Field>
          <Field label="Filière">
            <select className={inputCls} value={form.filiereId ?? ""} onChange={(e) => set("filiereId", e.target.value ? Number(e.target.value) : null)}>
              <option value="">—</option>
              {(filieres ?? []).map((f) => <option key={f.id} value={Number(f.id)}>{f.titre}</option>)}
            </select>
          </Field>
          <Field label="Niveau d'italien">
            <select className={inputCls} value={form.niveauItalien} onChange={(e) => set("niveauItalien", e.target.value)}>
              {NIVEAUX.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
          <Field label="Autres langues parlées"><input className={inputCls} value={form.autresLangues} onChange={(e) => set("autresLangues", e.target.value)} placeholder="Wolof, français, anglais…" /></Field>
          <Field label="Expérience (années)"><input type="number" min={0} className={inputCls} value={form.experienceAnnees} onChange={(e) => set("experienceAnnees", e.target.value as any)} /></Field>
          <Field label="Statut">
            <select className={inputCls} value={form.statut} onChange={(e) => set("statut", e.target.value)}>
              {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Compétences"><textarea className={inputCls} rows={2} value={form.competences} onChange={(e) => set("competences", e.target.value)} /></Field>
          <Field label="Notes"><textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
          <div className="flex gap-2 sm:justify-end items-end sm:col-span-2">
            <Btn type="submit" variant="gold">{editId ? "Enregistrer" : "Créer"}</Btn>
            {editId && <Btn variant="ghost" onClick={() => { setEditId(null); setForm(empty); }}>Annuler</Btn>}
          </div>
        </form>
      )}

      <input className={`${inputCls} mb-4 max-w-sm`} placeholder="🔍 Rechercher (nom, métier, langue…)" value={search} onChange={(e) => setSearch(e.target.value)} />

      <Table head={["Nom", "Âge", "Métier", "Filière", "Italien", "Autres langues", "Statut", "Actions"]}>
        {list.map((t) => (
          <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50">
            <td className="px-4 py-3 font-semibold">{t.prenom} {t.nom}
              <div className="text-xs font-normal text-slate-500">{t.sexe}{t.situationFamiliale ? ` · ${t.situationFamiliale}` : ""}</div>
            </td>
            <td className="px-4 py-3">{t.age || "—"}</td>
            <td className="px-4 py-3">{t.metier || t.profession || "—"}
              <div className="text-xs text-slate-500">{t.qualification}</div>
            </td>
            <td className="px-4 py-3 text-xs">{filiereNom(t.filiereId)}</td>
            <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">{t.niveauItalien}</span></td>
            <td className="px-4 py-3 text-xs">{t.autresLangues || "—"}</td>
            <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">{t.statut}</span></td>
            <td className="px-4 py-3 whitespace-nowrap">
              <button className="text-blue-600 font-bold text-xs mr-2" onClick={() => { setForm({ ...empty, ...t, inscriptionId: t.inscriptionId ?? null, filiereId: t.filiereId ?? null } as Form); setEditId(Number(t.id)); setShowForm(true); }}>✏️</button>
              <button className="text-red-600 font-bold text-xs" onClick={() => { if (confirm("Supprimer ce travailleur ?")) del.mutate({ token, id: Number(t.id) }); }}>🗑️</button>
            </td>
          </tr>
        ))}
        {list.length === 0 && (
          <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Aucun travailleur. Importez depuis les inscriptions ou créez-en un.</td></tr>
        )}
      </Table>
    </section>
  );
}
