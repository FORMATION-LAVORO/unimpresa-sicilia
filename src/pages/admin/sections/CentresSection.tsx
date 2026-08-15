import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAdmin, Field, Btn, Table, ExportBtn, inputCls } from "../ui";

const empty = {
  nom: "", partenaire: "", typePartenaire: "privé", adresse: "",
  ville: "Dakar", capacite: 0, contact: "", statut: "actif",
};
type Form = typeof empty;

const TYPES = ["Commune", "Ministère", "Chambre des Métiers (CMD)", "privé", "ONG", "autre"];

export default function CentresSection() {
  const { token, refresh } = useAdmin();
  const { data: centres } = trpc.admin.listCentres.useQuery({ token });
  const { data: inscriptions } = trpc.admin.listInscriptions.useQuery({ token });
  const create = trpc.admin.createCentre.useMutation({ onSuccess: refresh });
  const update = trpc.admin.updateCentre.useMutation({ onSuccess: refresh });
  const del = trpc.admin.deleteCentre.useMutation({ onSuccess: refresh });

  const [form, setForm] = useState<Form>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const set = (k: keyof Form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, capacite: Number(form.capacite) };
    if (editId) await update.mutateAsync({ token, id: editId, data });
    else await create.mutateAsync({ token, data });
    setForm(empty); setEditId(null); setShowForm(false);
  };

  const occupation = (id: number) => (inscriptions ?? []).filter((i) => Number(i.centreId) === id).length;

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-extrabold text-[#1a2a4a]">🏢 Centres de formation</h2>
        <div className="flex gap-2">
          <ExportBtn dataset="centres" />
          <Btn variant="gold" onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }}>
            {showForm ? "Fermer" : "+ Nouveau centre"}
          </Btn>
        </div>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Centres gérés avec les partenaires : Communes, Ministères, Chambre des Métiers de Dakar (CMD), centres privés…
      </p>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 grid sm:grid-cols-2 gap-4">
          <Field label="Nom du centre"><input required className={inputCls} value={form.nom} onChange={(e) => set("nom", e.target.value)} placeholder="Centre CMD de Dakar" /></Field>
          <Field label="Partenaire"><input className={inputCls} value={form.partenaire} onChange={(e) => set("partenaire", e.target.value)} placeholder="Chambre des Métiers de Dakar" /></Field>
          <Field label="Type de partenaire">
            <select className={inputCls} value={form.typePartenaire} onChange={(e) => set("typePartenaire", e.target.value)}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Ville"><input className={inputCls} value={form.ville} onChange={(e) => set("ville", e.target.value)} /></Field>
          <Field label="Adresse"><input className={inputCls} value={form.adresse} onChange={(e) => set("adresse", e.target.value)} /></Field>
          <Field label="Capacité (places)"><input type="number" min={0} className={inputCls} value={form.capacite} onChange={(e) => set("capacite", e.target.value as any)} /></Field>
          <Field label="Contact"><input className={inputCls} value={form.contact} onChange={(e) => set("contact", e.target.value)} placeholder="Téléphone / email" /></Field>
          <Field label="Statut">
            <select className={inputCls} value={form.statut} onChange={(e) => set("statut", e.target.value)}>
              <option value="actif">actif</option><option value="inactif">inactif</option>
            </select>
          </Field>
          <div className="flex gap-2 sm:justify-end items-end sm:col-span-2">
            <Btn type="submit" variant="gold">{editId ? "Enregistrer" : "Créer"}</Btn>
            {editId && <Btn variant="ghost" onClick={() => { setEditId(null); setForm(empty); }}>Annuler</Btn>}
          </div>
        </form>
      )}

      <Table head={["Centre", "Partenaire", "Type", "Ville", "Remplissage", "Contact", "Actions"]}>
        {(centres ?? []).map((c) => {
          const occ = occupation(Number(c.id));
          const pct = c.capacite > 0 ? Math.round((occ / c.capacite) * 100) : 0;
          return (
            <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
              <td className="px-4 py-3 font-semibold">{c.nom}</td>
              <td className="px-4 py-3 text-xs">{c.partenaire || "—"}</td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">{c.typePartenaire}</span></td>
              <td className="px-4 py-3 text-xs">{c.ville}</td>
              <td className="px-4 py-3">
                <div className="w-28">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : "bg-green-500"}`} style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{occ}/{c.capacite || "∞"} ({pct}%)</div>
                </div>
              </td>
              <td className="px-4 py-3 text-xs">{c.contact || "—"}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <button className="text-blue-600 font-bold text-xs mr-2" onClick={() => { setForm({ nom: c.nom, partenaire: c.partenaire, typePartenaire: c.typePartenaire, adresse: c.adresse, ville: c.ville, capacite: c.capacite, contact: c.contact, statut: c.statut }); setEditId(Number(c.id)); setShowForm(true); }}>✏️</button>
                <button className="text-red-600 font-bold text-xs" onClick={() => { if (confirm("Supprimer ce centre ?")) del.mutate({ token, id: Number(c.id) }); }}>🗑️</button>
              </td>
            </tr>
          );
        })}
        {(centres ?? []).length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Aucun centre enregistré.</td></tr>}
      </Table>
    </section>
  );
}
