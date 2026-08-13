import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";

const MOTIFS = [
  "Informations sur la formation",
  "Validation de mon dossier d'inscription",
  "Modalités de paiement",
  "Questions sur les métiers",
  "Autre demande",
];

export default function RendezVous() {
  const { data } = trpc.site.publicData.useQuery();
  const mutation = trpc.site.prendreRdv.useMutation();

  const params = data?.params ?? {};
  const primaire = params.couleur_principale ?? "#1a2a4a";
  const accent = params.couleur_accent ?? "#c9a227";
  const fond = params.couleur_fond ?? "#0f1f2e";

  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ prenom: "", nom: "", telephone: "", email: "", motif: "", dateSouhaitee: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const input = "w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#c9a227] bg-white";
  const label = "block text-sm font-semibold text-slate-700 mb-1";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await mutation.mutateAsync(form);
      setDone(true);
    } catch (err: any) {
      setError(err?.message ?? "Une erreur est survenue.");
    }
  };

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: `linear-gradient(160deg, ${fond}, ${primaire})` }}>
      <div className="max-w-md mx-auto">
        <Link to="/" className="text-white/70 hover:text-white text-sm">← Retour à l'accueil</Link>
        <div className="mt-4 bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {done ? (
            <div className="text-center py-10">
              <div className="text-6xl">✅</div>
              <h1 className="mt-4 text-2xl font-extrabold" style={{ color: primaire }}>Rendez-vous confirmé !</h1>
              <p className="mt-3 text-slate-600">
                Merci {form.prenom}. Votre demande de rendez-vous a été enregistrée.
                Nous vous contacterons au {form.telephone} pour confirmer la date et l'heure.
              </p>
              <Link to="/" className="mt-6 inline-block px-8 py-3 rounded-xl font-bold text-white" style={{ background: primaire }}>
                Retour à l'accueil
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center">
                <span className="inline-flex w-14 h-14 rounded-full items-center justify-center text-2xl" style={{ background: primaire }}>📅</span>
                <h1 className="mt-3 text-2xl font-extrabold" style={{ color: primaire }}>Prendre rendez-vous</h1>
                <p className="mt-1 text-sm text-slate-500">Rencontrez notre équipe au centre de Dakar</p>
              </div>
              <form onSubmit={submit} className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={label}>Prénom *</label><input required className={input} value={form.prenom} onChange={(e) => set("prenom", e.target.value)} /></div>
                  <div><label className={label}>Nom *</label><input required className={input} value={form.nom} onChange={(e) => set("nom", e.target.value)} /></div>
                </div>
                <div><label className={label}>Téléphone *</label><input required type="tel" className={input} value={form.telephone} onChange={(e) => set("telephone", e.target.value)} placeholder="+221 77 000 00 00" /></div>
                <div><label className={label}>Email</label><input type="email" className={input} value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
                <div>
                  <label className={label}>Motif du rendez-vous *</label>
                  <select required className={input} value={form.motif} onChange={(e) => set("motif", e.target.value)}>
                    <option value="" disabled>— Choisissez un motif —</option>
                    {MOTIFS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div><label className={label}>Date souhaitée</label><input type="date" className={input} value={form.dateSouhaitee} onChange={(e) => set("dateSouhaitee", e.target.value)} /></div>
                {error && <p className="text-sm font-semibold text-red-600 bg-red-50 rounded-lg px-4 py-2.5">{error}</p>}
                <button type="submit" disabled={mutation.isPending}
                  className="w-full py-4 rounded-xl font-bold text-lg shadow-lg hover:brightness-110 transition disabled:opacity-60"
                  style={{ background: accent, color: fond }}>
                  {mutation.isPending ? "Envoi…" : "📅 Confirmer le rendez-vous"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
