import { useEffect, useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAdmin, Field, Btn, inputCls } from "../ui";

/** Regroupe les paramètres par thème pour une édition conviviale */
const GROUPS: { titre: string; icon: string; keys: string[] }[] = [
  {
    titre: "Organisation & identité", icon: "🏛️",
    keys: ["org_name", "hero_subtitle", "hero_description", "logo_url", "footer_texte"],
  },
  {
    titre: "Boutons & labels", icon: "🔘",
    keys: ["cta_inscription", "cta_rdv", "cta_metiers", "cta_final", "badge_certifiee", "badge_certifiee_label", "duree_label", "participants_label", "ville_label"],
  },
  {
    titre: "Sections", icon: "📑",
    keys: ["section_filieres_titre", "section_filieres_soustitre", "section_programme_titre", "section_tarifs_titre", "tarifs_col_description", "tarifs_col_montant"],
  },
  {
    titre: "Paiement & devise", icon: "💰",
    keys: ["devise", "cout_total", "tranche_1", "tranche_2", "tranche_3", "info_titre", "info_texte"],
  },
  {
    titre: "Couleurs", icon: "🎨",
    keys: ["couleur_fond", "couleur_principale", "couleur_accent"],
  },
  {
    titre: "Contact & adresse", icon: "📞",
    keys: ["adresse_centre", "contact_email", "contact_telephone", "contact_whatsapp"],
  },
];

const LONG_TEXT = new Set(["info_texte", "hero_description", "section_filieres_soustitre", "footer_texte", "adresse_centre"]);
const COLORS = new Set(["couleur_fond", "couleur_principale", "couleur_accent"]);

export default function ParametresSection() {
  const { token, refresh } = useAdmin();
  const { data } = trpc.admin.listParametres.useQuery({ token });
  const setParam = trpc.admin.setParametre.useMutation({ onSuccess: refresh });
  const changePwd = trpc.admin.changePassword.useMutation();

  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState("");
  const [pwd, setPwd] = useState({ oldPassword: "", newPassword: "" });
  const [pwdMsg, setPwdMsg] = useState("");

  useEffect(() => {
    if (data) setValues(Object.fromEntries(data.map((p) => [p.cle, p.valeur])));
  }, [data]);

  const saveGroup = async (keys: string[]) => {
    for (const cle of keys) {
      await setParam.mutateAsync({ token, cle, valeur: values[cle] ?? "" });
    }
    setSaved(keys[0]);
    setTimeout(() => setSaved(""), 2000);
  };

  return (
    <section className="space-y-8">
      <h2 className="text-xl font-extrabold text-[#1a2a4a]">Paramètres du site</h2>
      <p className="text-sm text-slate-500 -mt-4">
        Tous les textes, couleurs et coordonnées du site public se modifient ici — les changements sont visibles immédiatement.
      </p>

      {GROUPS.map((g) => (
        <div key={g.titre} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="font-extrabold text-[#1a2a4a] mb-4">{g.icon} {g.titre}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {g.titre.includes("Paiement") && (
              <div className="sm:col-span-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
                💡 <b>cout_total</b> : coût total du programme (ex. 560000). <b>tranche_1 / tranche_2 / tranche_3</b> : montants des versements —
                la somme des tranches est déduite du coût pour calculer le reliquat. Ces valeurs pilotent tout le back-office (Paiements, Inscriptions, alertes).
              </div>
            )}
            {g.keys.map((cle) => (
              <div key={cle} className={LONG_TEXT.has(cle) ? "sm:col-span-2" : ""}>
                <Field label={cle}>
                  {LONG_TEXT.has(cle) ? (
                    <textarea rows={3} className={inputCls} value={values[cle] ?? ""} onChange={(e) => setValues({ ...values, [cle]: e.target.value })} />
                  ) : COLORS.has(cle) ? (
                    <div className="flex items-center gap-2">
                      <input type="color" className="w-12 h-9 rounded border border-slate-300 cursor-pointer" value={values[cle] || "#000000"} onChange={(e) => setValues({ ...values, [cle]: e.target.value })} />
                      <input className={inputCls} value={values[cle] ?? ""} onChange={(e) => setValues({ ...values, [cle]: e.target.value })} />
                    </div>
                  ) : (
                    <input className={inputCls} value={values[cle] ?? ""} onChange={(e) => setValues({ ...values, [cle]: e.target.value })} />
                  )}
                </Field>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Btn variant="gold" onClick={() => saveGroup(g.keys)} disabled={setParam.isPending}>💾 Enregistrer ce groupe</Btn>
            {saved === g.keys[0] && <span className="text-green-600 text-sm font-bold">✓ Enregistré !</span>}
          </div>
        </div>
      ))}

      {/* Sécurité */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h3 className="font-extrabold text-[#1a2a4a] mb-4">🔐 Changer le mot de passe admin</h3>
        <form
          className="grid sm:grid-cols-2 gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setPwdMsg("");
            try {
              await changePwd.mutateAsync({ token, ...pwd });
              setPwdMsg("✓ Mot de passe mis à jour !");
              setPwd({ oldPassword: "", newPassword: "" });
            } catch (err: any) {
              setPwdMsg(err?.message ?? "Erreur.");
            }
          }}
        >
          <Field label="Ancien mot de passe">
            <input required type="password" className={inputCls} value={pwd.oldPassword} onChange={(e) => setPwd({ ...pwd, oldPassword: e.target.value })} />
          </Field>
          <Field label="Nouveau mot de passe (min. 6 caractères)">
            <input required type="password" minLength={6} className={inputCls} value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} />
          </Field>
          <div className="sm:col-span-2 flex items-center gap-3">
            <Btn type="submit" variant="primary">Mettre à jour</Btn>
            {pwdMsg && <span className="text-sm font-bold text-slate-700">{pwdMsg}</span>}
          </div>
        </form>
      </div>
    </section>
  );
}
