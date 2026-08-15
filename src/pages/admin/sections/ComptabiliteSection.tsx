import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAdmin, Field, Btn, Table, ExportBtn, inputCls } from "../ui";

const empty = {
  date: new Date().toISOString().slice(0, 10),
  type: "recette", categorie: "", libelle: "", montantChiffres: "",
  montantLettres: "", modePaiement: "espèces", inscriptionId: null as number | null, notes: "",
};
type Form = typeof empty;

const fmt = (n: number) => n.toLocaleString("fr-FR").replace(/,/g, " ");

const PERIODES = [
  { key: "jour", label: "Journalier" },
  { key: "semaine", label: "Hebdomadaire" },
  { key: "mois", label: "Mensuel" },
  { key: "trimestre", label: "Trimestriel" },
  { key: "annee", label: "Annuel" },
];

/** Bilans périodiques avec diagramme en barres */
function ComptaPeriode({ token }: { token: string }) {
  const [periode, setPeriode] = useState("mois");
  const { data } = trpc.admin.comptaPeriode.useQuery({ token, periode });
  const rows = (data ?? []).slice(0, 12).reverse();
  const max = Math.max(1, ...rows.map((r) => Math.max(r.recettes, r.depenses)));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="font-bold text-[#1a2a4a]">📈 Bilans périodiques</h3>
        <div className="flex gap-1.5 flex-wrap">
          {PERIODES.map((p) => (
            <button key={p.key} onClick={() => setPeriode(p.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${periode === p.key ? "bg-[#c9a227] text-[#0f1f2e]" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      {rows.length === 0 && <p className="text-sm text-slate-400">Aucune donnée pour cette période.</p>}
      <div className="space-y-2.5">
        {rows.map((r) => (
          <div key={r.periode}>
            <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
              <span>{r.periode}</span>
              <span>solde {fmt(r.solde)} FCFA</span>
            </div>
            <div className="flex gap-1 items-center">
              <div className="h-3.5 bg-green-500 rounded" style={{ width: `${(r.recettes / max) * 48}%` }} title={`Recettes ${fmt(r.recettes)}`} />
              <div className="h-3.5 bg-red-400 rounded" style={{ width: `${(r.depenses / max) * 48}%` }} title={`Dépenses ${fmt(r.depenses)}`} />
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">🟩 recettes {fmt(r.recettes)} · 🟥 dépenses {fmt(r.depenses)} · {r.count} opération(s)</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ComptabiliteSection() {
  const { token, refresh } = useAdmin();
  const { data: transactions } = trpc.admin.listTransactions.useQuery({ token });
  const { data: bilan } = trpc.admin.bilanCompta.useQuery({ token });
  const create = trpc.admin.createTransaction.useMutation({ onSuccess: refresh });
  const update = trpc.admin.updateTransaction.useMutation({ onSuccess: refresh });
  const del = trpc.admin.deleteTransaction.useMutation({ onSuccess: refresh });

  const [form, setForm] = useState<Form>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filtre, setFiltre] = useState<"tous" | "recette" | "dépense">("tous");
  const set = (k: keyof Form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await update.mutateAsync({ token, id: editId, data: form });
    else await create.mutateAsync({ token, data: form });
    setForm(empty); setEditId(null); setShowForm(false);
  };

  const list = (transactions ?? []).filter((t) => filtre === "tous" || t.type === filtre);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-extrabold text-[#1a2a4a]">🧾 Comptabilité</h2>
        <div className="flex gap-2">
          <ExportBtn dataset="comptabilite" />
          <Btn variant="gold" onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }}>
            {showForm ? "Fermer" : "+ Nouvelle transaction"}
          </Btn>
        </div>
      </div>

      <ComptaPeriode token={token} />

      {/* Bilan */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="text-xs font-bold text-slate-500 uppercase">Recettes</div>
          <div className="text-xl font-extrabold text-green-700">{fmt(bilan?.recettes ?? 0)} FCFA</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="text-xs font-bold text-slate-500 uppercase">Dépenses</div>
          <div className="text-xl font-extrabold text-red-700">{fmt(bilan?.depenses ?? 0)} FCFA</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="text-xs font-bold text-slate-500 uppercase">Solde</div>
          <div className={`text-xl font-extrabold ${(bilan?.solde ?? 0) >= 0 ? "text-[#1a2a4a]" : "text-red-700"}`}>{fmt(bilan?.solde ?? 0)} FCFA</div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 grid sm:grid-cols-2 gap-4">
          <Field label="Date"><input required type="date" className={inputCls} value={form.date} onChange={(e) => set("date", e.target.value)} /></Field>
          <Field label="Type">
            <select className={inputCls} value={form.type} onChange={(e) => set("type", e.target.value)}>
              <option value="recette">Recette</option><option value="dépense">Dépense</option>
            </select>
          </Field>
          <Field label="Catégorie"><input className={inputCls} value={form.categorie} onChange={(e) => set("categorie", e.target.value)} placeholder="Inscriptions, loyer, matériel…" /></Field>
          <Field label="Libellé"><input required className={inputCls} value={form.libelle} onChange={(e) => set("libelle", e.target.value)} /></Field>
          <Field label="Montant (chiffres)"><input required className={inputCls} value={form.montantChiffres} onChange={(e) => set("montantChiffres", e.target.value)} placeholder="220 000" /></Field>
          <Field label="Mode de paiement">
            <select className={inputCls} value={form.modePaiement} onChange={(e) => set("modePaiement", e.target.value)}>
              {["espèces", "virement", "mobile money", "chèque", "autre"].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Notes"><textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
          <p className="text-xs text-slate-500 self-end">💡 Le montant en lettres est généré automatiquement à partir du montant en chiffres.</p>
          <div className="flex gap-2 sm:justify-end items-end sm:col-span-2">
            <Btn type="submit" variant="gold">{editId ? "Enregistrer" : "Créer"}</Btn>
            {editId && <Btn variant="ghost" onClick={() => { setEditId(null); setForm(empty); }}>Annuler</Btn>}
          </div>
        </form>
      )}

      <div className="flex gap-2 mb-3">
        {(["tous", "recette", "dépense"] as const).map((f) => (
          <Btn key={f} variant={filtre === f ? "gold" : "ghost"} onClick={() => setFiltre(f)}>
            {f === "tous" ? "Tous" : f === "recette" ? "Recettes" : "Dépenses"}
          </Btn>
        ))}
      </div>

      <Table head={["Date", "Type", "Libellé", "Montant", "En lettres", "Paiement", "Actions"]}>
        {list.map((t) => (
          <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50">
            <td className="px-4 py-3 text-xs whitespace-nowrap">{t.date}</td>
            <td className="px-4 py-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${t.type === "recette" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{t.type}</span>
            </td>
            <td className="px-4 py-3 font-semibold">{t.libelle}<div className="text-xs text-slate-400">{t.categorie}</div></td>
            <td className="px-4 py-3 font-bold whitespace-nowrap">{t.montantChiffres} FCFA</td>
            <td className="px-4 py-3 text-xs italic text-slate-500">{t.montantLettres}</td>
            <td className="px-4 py-3 text-xs">{t.modePaiement}</td>
            <td className="px-4 py-3 whitespace-nowrap">
              <button className="text-blue-600 font-bold text-xs mr-2" onClick={() => { setForm({ ...empty, ...t, inscriptionId: t.inscriptionId ?? null } as Form); setEditId(Number(t.id)); setShowForm(true); }}>✏️</button>
              <button className="text-red-600 font-bold text-xs" onClick={() => { if (confirm("Supprimer cette transaction ?")) del.mutate({ token, id: Number(t.id) }); }}>🗑️</button>
            </td>
          </tr>
        ))}
        {list.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Aucune transaction.</td></tr>}
      </Table>
    </section>
  );
}
