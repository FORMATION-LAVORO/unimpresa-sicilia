import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAdmin, Field, Btn, Table, ExportBtn, inputCls } from "../ui";

const emptyOffre = {
  titre: "", entreprise: "", ville: "", filiereId: null as number | null,
  metier: "", typeContrat: "", salaire: "", description: "", statut: "ouverte",
};
const emptyMatching = {
  travailleurId: 0, offreId: null as number | null, filiereId: null as number | null,
  type: "emploi", score: 0, statut: "proposé", notes: "",
};

export default function MatchingSection() {
  const { token, refresh } = useAdmin();
  const { data: offres } = trpc.admin.listOffres.useQuery({ token });
  const { data: travailleurs } = trpc.admin.listTravailleurs.useQuery({ token });
  const { data: filieres } = trpc.admin.listFilieres.useQuery({ token });
  const { data: matchings } = trpc.admin.listMatchings.useQuery({ token });

  const createOffre = trpc.admin.createOffre.useMutation({ onSuccess: refresh });
  const updateOffre = trpc.admin.updateOffre.useMutation({ onSuccess: refresh });
  const delOffre = trpc.admin.deleteOffre.useMutation({ onSuccess: refresh });
  const createMatching = trpc.admin.createMatching.useMutation({ onSuccess: refresh });
  const updateMatching = trpc.admin.updateMatching.useMutation({ onSuccess: refresh });
  const delMatching = trpc.admin.deleteMatching.useMutation({ onSuccess: refresh });

  const [tab, setTab] = useState<"matchings" | "offres" | "entreprises">("matchings");
  const [offreForm, setOffreForm] = useState(emptyOffre);
  const [matchForm, setMatchForm] = useState(emptyMatching);
  const [editOffreId, setEditOffreId] = useState<number | null>(null);
  const [showOffreForm, setShowOffreForm] = useState(false);
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [suggestFor, setSuggestFor] = useState<number>(0);

  const { data: suggestions } = trpc.admin.suggestMatches.useQuery(
    { token, travailleurId: suggestFor },
    { enabled: suggestFor > 0 },
  );

  const travNom = (id: number | null) => {
    const t = travailleurs?.find((x) => Number(x.id) === id);
    return t ? `${t.prenom} ${t.nom}` : `#${id}`;
  };
  const offreNom = (id: number | null) => offres?.find((o) => Number(o.id) === id)?.titre ?? "—";
  const filiereNom = (id: number | null) => filieres?.find((f) => Number(f.id) === id)?.titre ?? "—";

  const submitOffre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editOffreId) await updateOffre.mutateAsync({ token, id: editOffreId, data: offreForm });
    else await createOffre.mutateAsync({ token, data: offreForm });
    setOffreForm(emptyOffre); setEditOffreId(null); setShowOffreForm(false);
  };

  const submitMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchForm.travailleurId) return alert("Choisissez un travailleur");
    await createMatching.mutateAsync({ token, data: { ...matchForm, score: Number(matchForm.score) } });
    setMatchForm(emptyMatching); setShowMatchForm(false);
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-extrabold text-[#1a2a4a]">🔗 Matching travailleurs ↔ emplois / filières</h2>
        <div className="flex gap-2">
          <ExportBtn dataset="offres" label="Exporter offres" />
          <ExportBtn dataset="matchings" label="Exporter matchings" />
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <Btn variant={tab === "matchings" ? "gold" : "ghost"} onClick={() => setTab("matchings")}>🔗 Matchings</Btn>
        <Btn variant={tab === "offres" ? "gold" : "ghost"} onClick={() => setTab("offres")}>💼 Offres d'emploi en Italie</Btn>
        <Btn variant={tab === "entreprises" ? "gold" : "ghost"} onClick={() => setTab("entreprises")}>🏭 Fiches pour entreprises</Btn>
      </div>

      {tab === "entreprises" && <FichesEntreprises token={token} />}

      {tab === "offres" && (
        <>
          <div className="mb-4">
            <Btn variant="gold" onClick={() => { setOffreForm(emptyOffre); setEditOffreId(null); setShowOffreForm(!showOffreForm); }}>
              {showOffreForm ? "Fermer" : "+ Nouvelle offre"}
            </Btn>
          </div>
          {showOffreForm && (
            <form onSubmit={submitOffre} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 grid sm:grid-cols-2 gap-4">
              <Field label="Titre du poste"><input required className={inputCls} value={offreForm.titre} onChange={(e) => setOffreForm({ ...offreForm, titre: e.target.value })} /></Field>
              <Field label="Entreprise"><input className={inputCls} value={offreForm.entreprise} onChange={(e) => setOffreForm({ ...offreForm, entreprise: e.target.value })} /></Field>
              <Field label="Ville (Italie)"><input className={inputCls} value={offreForm.ville} onChange={(e) => setOffreForm({ ...offreForm, ville: e.target.value })} placeholder="Palerme, Catane…" /></Field>
              <Field label="Métier"><input className={inputCls} value={offreForm.metier} onChange={(e) => setOffreForm({ ...offreForm, metier: e.target.value })} /></Field>
              <Field label="Filière">
                <select className={inputCls} value={offreForm.filiereId ?? ""} onChange={(e) => setOffreForm({ ...offreForm, filiereId: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">—</option>
                  {(filieres ?? []).map((f) => <option key={f.id} value={Number(f.id)}>{f.titre}</option>)}
                </select>
              </Field>
              <Field label="Type de contrat"><input className={inputCls} value={offreForm.typeContrat} onChange={(e) => setOffreForm({ ...offreForm, typeContrat: e.target.value })} placeholder="CDI, saisonnier…" /></Field>
              <Field label="Salaire"><input className={inputCls} value={offreForm.salaire} onChange={(e) => setOffreForm({ ...offreForm, salaire: e.target.value })} placeholder="1 200 €/mois" /></Field>
              <Field label="Statut">
                <select className={inputCls} value={offreForm.statut} onChange={(e) => setOffreForm({ ...offreForm, statut: e.target.value })}>
                  <option value="ouverte">ouverte</option><option value="pourvue">pourvue</option><option value="fermée">fermée</option>
                </select>
              </Field>
              <Field label="Description"><textarea className={inputCls} rows={2} value={offreForm.description} onChange={(e) => setOffreForm({ ...offreForm, description: e.target.value })} /></Field>
              <div className="flex gap-2 sm:justify-end items-end sm:col-span-2">
                <Btn type="submit" variant="gold">{editOffreId ? "Enregistrer" : "Créer"}</Btn>
                {editOffreId && <Btn variant="ghost" onClick={() => { setEditOffreId(null); setOffreForm(emptyOffre); }}>Annuler</Btn>}
              </div>
            </form>
          )}
          <Table head={["Titre", "Entreprise", "Ville", "Métier", "Contrat", "Statut", "Actions"]}>
            {(offres ?? []).map((o) => (
              <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">{o.titre}</td>
                <td className="px-4 py-3">{o.entreprise || "—"}</td>
                <td className="px-4 py-3">{o.ville || "—"}</td>
                <td className="px-4 py-3">{o.metier || "—"}</td>
                <td className="px-4 py-3 text-xs">{o.typeContrat || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${o.statut === "ouverte" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>{o.statut}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button className="text-blue-600 font-bold text-xs mr-2" onClick={() => { setOffreForm({ ...emptyOffre, ...o, filiereId: o.filiereId ?? null } as typeof emptyOffre); setEditOffreId(Number(o.id)); setShowOffreForm(true); }}>✏️</button>
                  <button className="text-red-600 font-bold text-xs" onClick={() => { if (confirm("Supprimer cette offre ?")) delOffre.mutate({ token, id: Number(o.id) }); }}>🗑️</button>
                </td>
              </tr>
            ))}
            {(offres ?? []).length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Aucune offre d'emploi.</td></tr>}
          </Table>
        </>
      )}

      {tab === "matchings" && (
        <>
          {/* Suggestions automatiques */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-4">
            <h3 className="font-bold text-[#1a2a4a] mb-2">🤖 Suggestions automatiques</h3>
            <p className="text-xs text-slate-500 mb-3">Choisissez un travailleur : le système calcule les offres les plus compatibles (filière, métier, niveau d'italien, expérience).</p>
            <select className={`${inputCls} max-w-md`} value={suggestFor || ""} onChange={(e) => setSuggestFor(Number(e.target.value))}>
              <option value="">— Choisir un travailleur —</option>
              {(travailleurs ?? []).map((t) => <option key={t.id} value={Number(t.id)}>{t.prenom} {t.nom} — {t.metier || t.profession}</option>)}
            </select>
            {suggestFor > 0 && (
              <div className="mt-3 space-y-2">
                {(suggestions ?? []).length === 0 && <p className="text-sm text-slate-400">Aucune offre compatible pour le moment.</p>}
                {(suggestions ?? []).map((s, i) => (
                  <div key={i} className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 rounded-lg px-4 py-2.5">
                    <div className="text-sm">
                      <span className="font-bold">{s.offre.titre}</span>
                      <span className="text-slate-500"> — {s.offre.entreprise} ({s.offre.ville})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#c9a227]/20 text-[#8a6d1a] text-xs font-extrabold">score {s.score}</span>
                      <Btn variant="primary" onClick={() => {
                        createMatching.mutate({ token, data: { travailleurId: suggestFor, offreId: Number(s.offre.id), filiereId: s.offre.filiereId ?? null, type: "emploi", score: s.score, statut: "proposé", notes: "" } });
                      }}>Matcher</Btn>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-4">
            <Btn variant="gold" onClick={() => { setMatchForm(emptyMatching); setShowMatchForm(!showMatchForm); }}>
              {showMatchForm ? "Fermer" : "+ Matching manuel"}
            </Btn>
          </div>
          {showMatchForm && (
            <form onSubmit={submitMatch} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 grid sm:grid-cols-2 gap-4">
              <Field label="Travailleur">
                <select required className={inputCls} value={matchForm.travailleurId || ""} onChange={(e) => setMatchForm({ ...matchForm, travailleurId: Number(e.target.value) })}>
                  <option value="">—</option>
                  {(travailleurs ?? []).map((t) => <option key={t.id} value={Number(t.id)}>{t.prenom} {t.nom}</option>)}
                </select>
              </Field>
              <Field label="Type">
                <select className={inputCls} value={matchForm.type} onChange={(e) => setMatchForm({ ...matchForm, type: e.target.value })}>
                  <option value="emploi">Vers un emploi</option><option value="formation">Vers une filière de formation</option>
                </select>
              </Field>
              {matchForm.type === "emploi" ? (
                <Field label="Offre d'emploi">
                  <select className={inputCls} value={matchForm.offreId ?? ""} onChange={(e) => setMatchForm({ ...matchForm, offreId: e.target.value ? Number(e.target.value) : null })}>
                    <option value="">—</option>
                    {(offres ?? []).map((o) => <option key={o.id} value={Number(o.id)}>{o.titre} — {o.entreprise}</option>)}
                  </select>
                </Field>
              ) : (
                <Field label="Filière">
                  <select className={inputCls} value={matchForm.filiereId ?? ""} onChange={(e) => setMatchForm({ ...matchForm, filiereId: e.target.value ? Number(e.target.value) : null })}>
                    <option value="">—</option>
                    {(filieres ?? []).map((f) => <option key={f.id} value={Number(f.id)}>{f.titre}</option>)}
                  </select>
                </Field>
              )}
              <Field label="Score (0-100)"><input type="number" min={0} max={100} className={inputCls} value={matchForm.score} onChange={(e) => setMatchForm({ ...matchForm, score: e.target.value as any })} /></Field>
              <Field label="Statut">
                <select className={inputCls} value={matchForm.statut} onChange={(e) => setMatchForm({ ...matchForm, statut: e.target.value })}>
                  {["proposé", "accepté", "refusé", "abouti"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Notes"><textarea className={inputCls} rows={2} value={matchForm.notes} onChange={(e) => setMatchForm({ ...matchForm, notes: e.target.value })} /></Field>
              <div className="flex gap-2 sm:justify-end items-end sm:col-span-2">
                <Btn type="submit" variant="gold">Créer</Btn>
              </div>
            </form>
          )}

          <Table head={["Travailleur", "Type", "Cible", "Score", "Statut", "Actions"]}>
            {(matchings ?? []).map((m) => (
              <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">{travNom(Number(m.travailleurId))}</td>
                <td className="px-4 py-3 text-xs">{m.type}</td>
                <td className="px-4 py-3 text-xs">{m.type === "emploi" ? offreNom(m.offreId ?? null) : filiereNom(m.filiereId ?? null)}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-[#c9a227]/20 text-[#8a6d1a] text-xs font-extrabold">{m.score}</span></td>
                <td className="px-4 py-3">
                  <select className="text-xs font-bold rounded-lg border border-slate-300 px-2 py-1" value={m.statut}
                    onChange={(e) => updateMatching.mutate({ token, id: Number(m.id), data: { statut: e.target.value } })}>
                    {["proposé", "accepté", "refusé", "abouti"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button className="text-red-600 font-bold text-xs" onClick={() => { if (confirm("Supprimer ce matching ?")) delMatching.mutate({ token, id: Number(m.id) }); }}>🗑️</button>
                </td>
              </tr>
            ))}
            {(matchings ?? []).length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Aucun matching enregistré.</td></tr>}
          </Table>
        </>
      )}
    </section>
  );
}

/** Fiches détaillées des travailleurs, pensées pour les entreprises italiennes */
function FichesEntreprises({ token }: { token: string }) {
  const { data: fiches } = trpc.admin.fichesEntreprise.useQuery({ token });
  const [search, setSearch] = useState("");

  const list = (fiches ?? []).filter((f) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return [f.nom, f.prenom, f.metier, f.profession, f.qualification, f.autresLangues].some((v) => (v ?? "").toLowerCase().includes(s));
  });

  return (
    <>
      <p className="text-sm text-slate-500 mb-3">
        Vue destinée aux entreprises partenaires : chaque fiche résume les informations utiles au recrutement
        (âge, qualification, expérience, situation familiale, langues).
      </p>
      <input className={`${inputCls} mb-4 max-w-sm`} placeholder="🔍 Rechercher (métier, qualification, langue…)" value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="grid sm:grid-cols-2 gap-4">
        {list.map((f) => (
          <div key={f.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-extrabold text-[#1a2a4a]">{f.prenom} {f.nom}</div>
                <div className="text-xs text-slate-400 font-mono">{f.reference}</div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${f.statut === "placé" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>{f.statut}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <div><span className="text-slate-400 text-xs">Âge</span><div className="font-semibold">{f.age || "—"} ans</div></div>
              <div><span className="text-slate-400 text-xs">Situation</span><div className="font-semibold">{f.situationFamiliale || "—"}</div></div>
              <div><span className="text-slate-400 text-xs">Qualification</span><div className="font-semibold">{f.qualification || "—"}</div></div>
              <div><span className="text-slate-400 text-xs">Expérience</span><div className="font-semibold">{f.experienceAnnees} an(s)</div></div>
              <div><span className="text-slate-400 text-xs">Métier visé</span><div className="font-semibold">{f.metier || "—"}</div></div>
              <div><span className="text-slate-400 text-xs">Italien</span><div className="font-semibold">{f.niveauItalien}</div></div>
              <div className="col-span-2"><span className="text-slate-400 text-xs">Autres langues</span><div className="font-semibold">{f.autresLangues || "—"}</div></div>
              {f.competences && <div className="col-span-2"><span className="text-slate-400 text-xs">Compétences</span><div className="text-slate-600 text-xs">{f.competences}</div></div>}
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="sm:col-span-2 bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">Aucune fiche travailleur.</div>}
      </div>
    </>
  );
}
