import { Link } from "react-router";
import { trpc } from "@/providers/trpc";

type Params = Record<string, string>;
const P = (params: Params | undefined, key: string, fallback = "") =>
  params?.[key] ?? fallback;

export default function Home() {
  const { data, isLoading } = trpc.site.publicData.useQuery();
  const params = data?.params;
  const cycle = data?.cycle;

  const fond = P(params, "couleur_fond", "#0f1f2e");
  const primaire = P(params, "couleur_principale", "#1a2a4a");
  const accent = P(params, "couleur_accent", "#c9a227");
  const devise = P(params, "devise", "FCFA");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: fond }}>
        <div className="text-center animate-pulse">
          <div className="text-5xl mb-4">🎓</div>
          <p className="text-white/70 font-medium">Chargement…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 scroll-smooth" style={{ ["--accent" as string]: accent }}>
      {/* ─── HEADER FIXE ─────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <a href="#" className="flex items-center gap-2.5 min-w-0">
            {P(params, "logo_url") ? (
              <img src={P(params, "logo_url")} alt="logo" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <span className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0" style={{ background: primaire }}>
                🎓
              </span>
            )}
            <span className="font-extrabold text-lg leading-tight truncate" style={{ color: primaire }}>
              {P(params, "org_name", "UNIMPRESA Sicilia")}
            </span>
          </a>
          <div className="flex items-center gap-2">
            <Link
              to="/inscription"
              className="px-4 py-2.5 rounded-lg font-bold text-sm text-white shadow hover:brightness-110 transition whitespace-nowrap"
              style={{ background: primaire }}
            >
              {P(params, "cta_inscription", "🎓 Je veux m'inscrire")}
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO ────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-14 px-4" style={{ background: `linear-gradient(160deg, ${fond} 0%, ${primaire} 100%)` }}>
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            {P(params, "hero_titre") || P(params, "org_name", "UNIMPRESA Sicilia")}
          </h1>
          <p className="mt-3 text-lg md:text-xl font-semibold" style={{ color: accent }}>
            {P(params, "hero_subtitle")}
          </p>
          <p className="mt-3 text-white/70 max-w-xl mx-auto">{P(params, "hero_description")}</p>

          <div className="mt-6 flex flex-col items-center gap-3">
            {cycle?.sessionLabel && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-sm font-semibold" style={{ color: accent }}>
                📅 {cycle.sessionLabel}
              </span>
            )}
            {cycle?.lieu && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-sm font-semibold text-center" style={{ color: accent }}>
                🏛️ {cycle.lieu}
              </span>
            )}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/inscription"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base shadow-lg hover:brightness-110 hover:-translate-y-0.5 transition"
              style={{ background: accent, color: fond }}
            >
              {P(params, "cta_inscription", "🎓 Je veux m'inscrire")}
            </Link>
            <Link
              to="/rendezvous"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base border-2 hover:bg-white/5 transition"
              style={{ borderColor: accent, color: accent }}
            >
              {P(params, "cta_rdv")}
            </Link>
            <a
              href="#filieres"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base border-2 border-slate-400/50 text-slate-300 hover:bg-white/5 transition"
            >
              {P(params, "cta_metiers")}
            </a>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "📍", big: cycle?.ville ?? "Dakar", small: P(params, "ville_label", "Sénégal") },
              { icon: "✅", big: P(params, "badge_certifiee", "Certifiée"), small: P(params, "badge_certifiee_label", "Formation") },
              { icon: "⏱️", big: `${cycle?.dureeHeures ?? "120"}h`, small: P(params, "duree_label", "De cours") },
              { icon: "👥", big: String(cycle?.nbParticipants ?? 500), small: P(params, "participants_label", "Participants") },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl md:text-3xl font-extrabold" style={{ color: accent }}>{s.big}</div>
                <div className="text-sm text-white/60">{s.small}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PARTENAIRES ─────────────────────────────────────────────── */}
      {(data?.partenaires?.length ?? 0) > 0 && (
        <section id="partenaires" className="py-16 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-extrabold text-center" style={{ color: primaire }}>
              {P(params, "section_partenaires_titre", "Nos partenaires")}
            </h2>
            <p className="mt-3 text-center text-slate-500">{P(params, "section_partenaires_soustitre", "Un réseau de confiance")}</p>
            <div className="mt-10 grid sm:grid-cols-2 gap-6">
              {data?.partenaires?.map((p: any) => (
                <div key={p.id} className="rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:-translate-y-1 transition bg-slate-50">
                  <div className="flex items-center gap-3">
                    {p.logo ? (
                      <img src={p.logo} alt={p.nom} className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <span className="w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white font-extrabold" style={{ background: primaire }}>
                        {p.nom.charAt(0)}
                      </span>
                    )}
                    <h3 className="font-extrabold text-lg" style={{ color: primaire }}>{p.nom}</h3>
                  </div>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── FILIÈRES ────────────────────────────────────────────────── */}
      <section id="filieres" className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center" style={{ color: primaire }}>
            {P(params, "section_filieres_titre")}
          </h2>
          <p className="mt-3 text-center text-slate-500 max-w-2xl mx-auto">
            {P(params, "section_filieres_soustitre")}
          </p>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.filieres.map((f: any) => (
              <article
                key={f.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition overflow-hidden flex flex-col"
              >
                <div className="h-32 flex items-center justify-center text-5xl relative" style={{ background: primaire }}>
                  {f.icone}
                  {f.badge && (
                    <span className="absolute bottom-2 right-3 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: accent, color: fond }}>
                      {f.badge}
                    </span>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-xl font-extrabold" style={{ color: primaire }}>{f.titre}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed flex-1">{f.description}</p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4 text-sm text-slate-500">
                    <span>⏱ {f.dureeHeures}</span>
                    <span>📖 {f.nbMetiers} métiers</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DÉROULEMENT ─────────────────────────────────────────────── */}
      <section id="programme" className="py-16 px-4" style={{ background: primaire }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center text-white">
            {P(params, "section_programme_titre")}
          </h2>
          <div className="mt-10 space-y-6">
            {data?.etapes.map((e: any) => (
              <div key={e.id} className="flex gap-4 items-start">
                <span
                  className="w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 border-4 border-white/20"
                  style={{ background: accent, color: fond }}
                >
                  {e.numero}
                </span>
                <div className="flex-1 rounded-2xl bg-white/10 border border-white/15 p-5 hover:bg-white/15 transition">
                  <div className="text-2xl">{e.icone}</div>
                  <h3 className="mt-2 text-xl font-bold text-white">{e.titre}</h3>
                  <p className="mt-1.5 text-white/75 leading-relaxed">{e.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TARIFS ──────────────────────────────────────────────────── */}
      <section id="tarifs" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center" style={{ color: primaire }}>
            {P(params, "section_tarifs_titre")}
          </h2>

          <div className="mt-10 bg-white rounded-2xl shadow-md overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm font-bold tracking-wide" style={{ color: primaire }}>
                  <th className="px-5 py-4">{P(params, "tarifs_col_description", "DESCRIPTION")}</th>
                  <th className="px-5 py-4">{P(params, "tarifs_col_montant", "MONTANT")}</th>
                  <th className="px-5 py-4 hidden sm:table-cell">{P(params, "tarifs_col_description", "DESCRIPTION")}</th>
                </tr>
              </thead>
              <tbody>
                {data?.tarifs.map((t: any) => (
                  <tr key={t.id} className={t.estTotal ? "bg-amber-50 font-bold" : "border-t border-slate-100"}>
                    <td className="px-5 py-4 text-slate-700 font-medium">{t.label}</td>
                    <td className="px-5 py-4">
                      <span className="text-lg font-extrabold" style={{ color: t.estTotal ? accent : primaire }}>
                        {t.montantChiffres} {devise}
                      </span>
                      {t.montantLettres && (
                        <div className="text-xs text-slate-400">{t.montantLettres}</div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 hidden sm:table-cell">{t.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Encadré info */}
          <div className="mt-8 rounded-xl bg-amber-50/80 p-6" style={{ borderLeft: `5px solid ${accent}` }}>
            <h3 className="text-lg font-extrabold" style={{ color: primaire }}>
              {P(params, "info_titre")}
            </h3>
            <p className="mt-2 text-slate-600 leading-relaxed">{P(params, "info_texte")}</p>
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/inscription"
              className="inline-block px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:brightness-110 hover:-translate-y-0.5 transition"
              style={{ background: accent, color: fond }}
            >
              {P(params, "cta_final")}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── INFOS ESSENTIELLES ──────────────────────────────────────── */}
      <section id="infos" className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center" style={{ color: primaire }}>
            {P(params, "section_infos_titre", "Informations essentielles")}
          </h2>
          <div className="mt-10 grid sm:grid-cols-2 gap-4">
            {[
              { icon: "📍", label: "Lieu", value: `${cycle?.ville ?? "Dakar"} – ${cycle?.pays ?? "Sénégal"}` },
              { icon: "🗓", label: "Début", value: cycle?.dateDebut ?? "1 septembre 2026" },
              { icon: "📅", label: "Fin", value: cycle?.dateFin ?? "30 novembre 2026" },
              { icon: "⏱", label: "Durée", value: `${cycle?.dureeHeures ?? "120"} heures` },
              { icon: "👥", label: "Participants", value: `${cycle?.nbParticipants ?? 500} places` },
              { icon: "💰", label: "Coût", value: P(params, "cout_total", "560 000 FCFA") },
            ].map((i, idx) => (
              <div key={idx} className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 hover:shadow-md transition">
                <span className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl shrink-0">{i.icon}</span>
                <div>
                  <div className="text-xs font-bold tracking-wide text-slate-400 uppercase">{i.label}</div>
                  <div className="font-extrabold" style={{ color: primaire }}>{i.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── POURQUOI NOUS CHOISIR ───────────────────────────────────── */}
      {(data?.avantages?.length ?? 0) > 0 && (
        <section id="pourquoi" className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold text-center" style={{ color: primaire }}>
              {P(params, "section_pourquoi_titre", "Pourquoi nous choisir ?")}
            </h2>
            <p className="mt-3 text-center text-slate-500">{P(params, "section_pourquoi_soustitre")}</p>
            <div className="mt-10 space-y-4">
              {data?.avantages?.map((a: any) => (
                <div key={a.id} className="flex gap-4 bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition">
                  <span className="text-2xl shrink-0">{a.icone}</span>
                  <div>
                    <h3 className="font-extrabold" style={{ color: primaire }}>{a.titre}</h3>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                to="/inscription"
                className="inline-block px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:brightness-110 hover:-translate-y-0.5 transition"
                style={{ background: accent, color: fond }}
              >
                {P(params, "cta_inscription", "🎓 Je veux m'inscrire")}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── FOOTER / CONTACT ────────────────────────────────────────── */}
      <footer id="contact" className="py-12 px-4 text-white" style={{ background: fond }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: accent }}>🎓</span>
              <span className="font-extrabold text-lg">{P(params, "org_name")}</span>
            </div>
            <p className="mt-3 text-white/60 text-sm leading-relaxed">{P(params, "footer_texte")}</p>
          </div>
          <div>
            <h4 className="font-bold" style={{ color: accent }}>Adresse</h4>
            <p className="mt-2 text-white/70 text-sm leading-relaxed">{P(params, "adresse_centre")}</p>
          </div>
          <div>
            <h4 className="font-bold" style={{ color: accent }}>Contact</h4>
            <ul className="mt-2 space-y-1.5 text-white/70 text-sm">
              <li>✉️ {P(params, "contact_email")}</li>
              <li>📞 {P(params, "contact_telephone")}</li>
              <li>💬 WhatsApp : {P(params, "contact_whatsapp")}</li>
            </ul>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-10 pt-6 border-t border-white/10 text-center text-white/40 text-sm">
          © {new Date().getFullYear()} {P(params, "org_name")} — Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
