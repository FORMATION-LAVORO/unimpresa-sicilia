import { useMemo, useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";

const STEPS = [
  { icon: "👤", titre: "Identité" },
  { icon: "📞", titre: "Contact" },
  { icon: "💼", titre: "Situation professionnelle" },
  { icon: "🎓", titre: "Formation" },
  { icon: "✍️", titre: "Engagement" },
];

const DOCS = ["Carte d'identité", "Passeport", "Permis de conduire", "Diplômes", "Attestations", "Certificats"];

export default function Inscription() {
  const { data } = trpc.site.publicData.useQuery();
  const mutation = trpc.site.inscrire.useMutation();

  const params = data?.params ?? {};
  const primaire = params.couleur_principale ?? "#1a2a4a";
  const accent = params.couleur_accent ?? "#c9a227";
  const fond = params.couleur_fond ?? "#0f1f2e";

  const [step, setStep] = useState(0);
  const [done, setDone] = useState<{ numeroDossier: string } | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nom: "", prenom: "", dateNaissance: "", lieuNaissance: "",
    sexe: "", situationFamiliale: "", documents: [] as string[],
    telephone: "", adresse: "", email: "", urgenceNom: "", urgenceTelephone: "",
    enActivite: "", profession: "", employeur: "",
    filiereId: 0, metierChoisi: "", cycleId: 0,
    acceptEngagement: false, lieuSignature: "Dakar",
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const filieres = data?.filieres ?? [];
  const cycleId = form.cycleId || Number(data?.cycle?.id ?? 0);

  const metiers: string[] = useMemo(() => {
    const fil = filieres.find((f: any) => Number(f.id) === form.filiereId) as any;
    if (!fil?.metiers) return [];
    try { return JSON.parse(fil.metiers); } catch { return []; }
  }, [filieres, form.filiereId]);

  const input =
    "w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#c9a227] bg-white";
  const label = "block text-sm font-semibold text-slate-700 mb-1";

  const canNext = () => {
    if (step === 0) return form.nom && form.prenom && form.dateNaissance && form.sexe && form.situationFamiliale;
    if (step === 1) return form.telephone && form.adresse && form.email;
    if (step === 2) return form.enActivite !== "";
    if (step === 3) return form.filiereId && form.metierChoisi;
    return form.acceptEngagement;
  };

  const submit = async () => {
    setError("");
    try {
      const res = await mutation.mutateAsync({
        nom: form.nom, prenom: form.prenom, email: form.email, telephone: form.telephone,
        filiereId: form.filiereId, cycleId,
        dateNaissance: form.dateNaissance, lieuNaissance: form.lieuNaissance,
        sexe: form.sexe, situationFamiliale: form.situationFamiliale,
        documents: JSON.stringify(form.documents),
        adresse: form.adresse, urgenceNom: form.urgenceNom, urgenceTelephone: form.urgenceTelephone,
        enActivite: form.enActivite, profession: form.profession, employeur: form.employeur,
        metierChoisi: form.metierChoisi,
      });
      setDone({ numeroDossier: res.numeroDossier });
    } catch (err: any) {
      setError(err?.message ?? "Une erreur est survenue.");
    }
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: `linear-gradient(160deg, ${fond}, ${primaire})` }}>
      <div className="max-w-xl mx-auto">
        <Link to="/" className="text-white/70 hover:text-white text-sm">← Retour à l'accueil</Link>

        <div className="mt-4 bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {done ? (
            <div className="text-center py-8">
              <div className="text-6xl">🎉</div>
              <h1 className="mt-4 text-2xl font-extrabold" style={{ color: primaire }}>
                Inscription enregistrée avec succès !
              </h1>
              <div className="mt-5 inline-block rounded-xl px-6 py-4" style={{ background: `${accent}22`, border: `2px dashed ${accent}` }}>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Votre numéro de dossier</div>
                <div className="text-2xl font-extrabold" style={{ color: primaire }}>{done.numeroDossier}</div>
              </div>
              <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                Conservez précieusement ce numéro — il vous sera demandé lors du rendez-vous de validation.
                Notre équipe vous contactera au {form.telephone}.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/rendezvous" className="px-6 py-3 rounded-xl font-bold text-sm" style={{ background: accent, color: fond }}>
                  📅 Prendre rendez-vous
                </Link>
                <Link to="/" className="px-6 py-3 rounded-xl font-bold text-sm text-white" style={{ background: primaire }}>
                  Retour à l'accueil
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h1 className="text-2xl font-extrabold" style={{ color: primaire }}>
                  🎓 Inscription à la formation
                </h1>
                <p className="mt-1 text-sm text-slate-500">{params.org_name} — {data?.cycle?.nom}</p>
              </div>

              {/* Stepper */}
              <div className="mt-6 flex items-center justify-between">
                {STEPS.map((s, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold transition ${
                        i < step ? "bg-green-500 text-white" : i === step ? "text-white" : "bg-slate-200 text-slate-500"
                      }`}
                      style={i === step ? { background: primaire } : {}}
                    >
                      {i < step ? "✓" : i + 1}
                    </div>
                    <span className="mt-1 text-[10px] font-semibold text-slate-500 text-center leading-tight hidden sm:block">
                      {s.titre}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h2 className="font-extrabold text-lg mb-4" style={{ color: primaire }}>
                  {STEPS[step].icon} Étape {step + 1} — {STEPS[step].titre}
                </h2>

                {/* ── Étape 1 : Identité ── */}
                {step === 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={label}>Prénom *</label><input className={input} value={form.prenom} onChange={(e) => set("prenom", e.target.value)} /></div>
                      <div><label className={label}>Nom *</label><input className={input} value={form.nom} onChange={(e) => set("nom", e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={label}>Date de naissance *</label><input type="date" className={input} value={form.dateNaissance} onChange={(e) => set("dateNaissance", e.target.value)} /></div>
                      <div><label className={label}>Lieu de naissance</label><input className={input} value={form.lieuNaissance} onChange={(e) => set("lieuNaissance", e.target.value)} /></div>
                    </div>
                    <div>
                      <label className={label}>Sexe *</label>
                      <div className="flex gap-3">
                        {["Masculin", "Féminin"].map((s) => (
                          <button key={s} type="button" onClick={() => set("sexe", s)}
                            className={`flex-1 py-2.5 rounded-xl border-2 font-semibold text-sm transition ${form.sexe === s ? "border-[#c9a227] bg-amber-50" : "border-slate-200"}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={label}>Situation familiale *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Célibataire", "Marié(e)", "Divorcé(e)", "Veuf/Veuve"].map((s) => (
                          <button key={s} type="button" onClick={() => set("situationFamiliale", s)}
                            className={`py-2.5 rounded-xl border-2 font-semibold text-sm transition ${form.situationFamiliale === s ? "border-[#c9a227] bg-amber-50" : "border-slate-200"}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={label}>Documents en votre possession</label>
                      <div className="flex flex-wrap gap-2">
                        {DOCS.map((d) => (
                          <button key={d} type="button"
                            onClick={() => set("documents", form.documents.includes(d) ? form.documents.filter((x) => x !== d) : [...form.documents, d])}
                            className={`px-3 py-2 rounded-full border-2 text-xs font-semibold transition ${form.documents.includes(d) ? "border-[#c9a227] bg-amber-50" : "border-slate-200 text-slate-500"}`}>
                            {form.documents.includes(d) ? "✓ " : ""}{d}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Étape 2 : Contact ── */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div><label className={label}>Téléphone (WhatsApp) *</label><input type="tel" className={input} value={form.telephone} onChange={(e) => set("telephone", e.target.value)} placeholder="+221 77 000 00 00" /></div>
                    <div><label className={label}>Adresse complète *</label><input className={input} value={form.adresse} onChange={(e) => set("adresse", e.target.value)} placeholder="Quartier, ville" /></div>
                    <div><label className={label}>Email *</label><input type="email" className={input} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="vous@email.com" /></div>
                    <div className="rounded-xl bg-slate-50 p-4 space-y-3">
                      <p className="text-sm font-bold text-slate-600">Personne à contacter en cas d'urgence</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={label}>Nom complet</label><input className={input} value={form.urgenceNom} onChange={(e) => set("urgenceNom", e.target.value)} /></div>
                        <div><label className={label}>Téléphone</label><input className={input} value={form.urgenceTelephone} onChange={(e) => set("urgenceTelephone", e.target.value)} /></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Étape 3 : Situation professionnelle ── */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className={label}>Êtes-vous actuellement en activité ? *</label>
                      <div className="flex gap-3">
                        {["Oui", "Non"].map((s) => (
                          <button key={s} type="button" onClick={() => set("enActivite", s)}
                            className={`flex-1 py-3 rounded-xl border-2 font-semibold transition ${form.enActivite === s ? "border-[#c9a227] bg-amber-50" : "border-slate-200"}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    {form.enActivite === "Oui" && (
                      <>
                        <div><label className={label}>Profession actuelle</label><input className={input} value={form.profession} onChange={(e) => set("profession", e.target.value)} /></div>
                        <div><label className={label}>Employeur</label><input className={input} value={form.employeur} onChange={(e) => set("employeur", e.target.value)} /></div>
                      </>
                    )}
                  </div>
                )}

                {/* ── Étape 4 : Formation ── */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className={label}>Catégorie de métier *</label>
                      <select className={input} value={form.filiereId} onChange={(e) => { set("filiereId", Number(e.target.value)); set("metierChoisi", ""); }}>
                        <option value={0} disabled>— Choisir une catégorie —</option>
                        {filieres.map((f: any) => <option key={f.id} value={f.id}>{f.icone} {f.titre}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={label}>Métier choisi *</label>
                      <select className={input} value={form.metierChoisi} onChange={(e) => set("metierChoisi", e.target.value)} disabled={!metiers.length}>
                        <option value="" disabled>{metiers.length ? "— Choisir un métier —" : "Choisir d'abord une catégorie"}</option>
                        {metiers.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={label}>Cycle / Session</label>
                      <select className={input} value={cycleId} onChange={(e) => set("cycleId", Number(e.target.value))}>
                        {(data?.cycles ?? []).filter((c: any) => c.actif).map((c: any) => (
                          <option key={c.id} value={c.id}>{c.nom} — {c.sessionLabel}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* ── Étape 5 : Engagement ── */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-600 leading-relaxed max-h-64 overflow-y-auto">
                      <p className="font-bold text-slate-800 mb-2">Engagement du candidat</p>
                      <p>
                        Je soussigné(e) <strong>{form.prenom} {form.nom}</strong>, m'engage à suivre assidûment
                        la formation de {data?.cycle?.dureeHeures ?? "120"} heures du programme {params.org_name}, à régler les frais
                        selon les modalités prévues ({params.cout_total ?? "560 000 FCFA"}), et à respecter
                        le règlement intérieur du centre de formation.
                      </p>
                      <p className="mt-2">
                        Je certifie que les informations fournies dans ce dossier sont exactes et complètes.
                      </p>
                    </div>
                    <div><label className={label}>Fait à</label><input className={input} value={form.lieuSignature} onChange={(e) => set("lieuSignature", e.target.value)} /></div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-5 h-5 accent-[#c9a227]" checked={form.acceptEngagement} onChange={(e) => set("acceptEngagement", e.target.checked)} />
                      <span className="text-sm text-slate-700 font-medium">J'ai lu et j'accepte les termes de l'engagement ci-dessus. *</span>
                    </label>
                  </div>
                )}

                {error && <p className="mt-4 text-sm font-semibold text-red-600 bg-red-50 rounded-lg px-4 py-2.5">{error}</p>}

                {/* Navigation */}
                <div className="mt-6 flex gap-3">
                  {step > 0 && (
                    <button onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
                      ← Précédent
                    </button>
                  )}
                  {step < 4 ? (
                    <button
                      onClick={() => canNext() && setStep(step + 1)}
                      disabled={!canNext()}
                      className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition disabled:opacity-40"
                      style={{ background: primaire }}
                    >
                      Suivant →
                    </button>
                  ) : (
                    <button
                      onClick={submit}
                      disabled={!canNext() || mutation.isPending}
                      className="flex-1 py-3.5 rounded-xl font-bold shadow-lg transition disabled:opacity-40"
                      style={{ background: accent, color: fond }}
                    >
                      {mutation.isPending ? "Envoi en cours…" : "🎓 Soumettre mon dossier"}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
