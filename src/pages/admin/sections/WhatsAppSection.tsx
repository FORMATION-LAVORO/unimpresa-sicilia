import { useMemo, useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAdmin, Card, Table, Btn, Badge, Empty, Field, inputCls } from "../ui";

const TEMPLATES = [
  { key: "rappel", label: "Rappel de paiement", text: "Bonjour {prenom}, nous vous rappelons que votre reliquat de formation reste en attente. Merci de régulariser votre situation. — UNIMPRESA Sicilia" },
  { key: "convocation", label: "Convocation aux cours", text: "Bonjour {prenom}, vous êtes convoqué(e) aux cours de formation cette semaine au centre. Merci de confirmer votre présence. — UNIMPRESA Sicilia" },
  { key: "admission", label: "Félicitations admission", text: "Félicitations {prenom} ! Vous êtes admis(e) à la formation certifiée Sénégal → Italie. Prochaines étapes : modules et test final. — UNIMPRESA Sicilia" },
  { key: "visa", label: "Suivi visa", text: "Bonjour {prenom}, votre dossier visa progresse. Nous vous tiendrons informé(e) du résultat du dépôt à l'Ambassade d'Italie à Dakar. — UNIMPRESA Sicilia" },
];

type Historique = { date: string; destinataires: number; message: string };
const HIST_KEY = "unimpresa_whatsapp_historique";

function loadHistorique(): Historique[] {
  try { return JSON.parse(localStorage.getItem(HIST_KEY) ?? "[]"); } catch { return []; }
}

export default function WhatsAppSection() {
  const { token } = useAdmin();
  const { data: inscriptions } = trpc.admin.listInscriptions.useQuery({ token });
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [template, setTemplate] = useState(TEMPLATES[0].key);
  const [message, setMessage] = useState(TEMPLATES[0].text);
  const [filtre, setFiltre] = useState("");
  const [historique, setHistorique] = useState<Historique[]>(loadHistorique);

  const rows = useMemo(
    () =>
      (inscriptions ?? []).filter((i) =>
        `${i.prenom} ${i.nom} ${i.telephone}`.toLowerCase().includes(filtre.toLowerCase()),
      ),
    [inscriptions, filtre],
  );

  const toggle = (id: number) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  };

  const toggleAll = () => {
    if (selected.size === rows.length) setSelected(new Set());
    else setSelected(new Set(rows.map((r) => Number(r.id))));
  };

  const envoyer = () => {
    const dests = rows.filter((r) => selected.has(Number(r.id)));
    if (dests.length === 0) return;
    for (const d of dests) {
      const tel = String(d.telephone ?? "").replace(/[^\d]/g, "");
      const msg = encodeURIComponent(message.replace("{prenom}", d.prenom ?? ""));
      window.open(`https://wa.me/${tel}?text=${msg}`, "_blank");
    }
    const h: Historique = {
      date: new Date().toLocaleString("fr-FR"),
      destinataires: dests.length,
      message: message.slice(0, 120),
    };
    const next = [h, ...historique].slice(0, 50);
    setHistorique(next);
    localStorage.setItem(HIST_KEY, JSON.stringify(next));
    setSelected(new Set());
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <Card
        title="Liste des apprenants"
        icon="👥"
        actions={
          <input
            value={filtre}
            onChange={(e) => setFiltre(e.target.value)}
            placeholder="Rechercher…"
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm w-44"
          />
        }
      >
        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-3">
          <input type="checkbox" checked={rows.length > 0 && selected.size === rows.length} onChange={toggleAll} />
          Tout sélectionner ({selected.size}/{rows.length})
        </label>
        {rows.length === 0 ? <Empty /> : (
          <div className="max-h-[420px] overflow-y-auto">
            <Table head={["", "Nom", "Téléphone", "Statut"]}>
              {rows.map((i) => (
                <tr key={i.id} className="border-t border-slate-100">
                  <td className="px-4 py-2.5">
                    <input type="checkbox" checked={selected.has(Number(i.id))} onChange={() => toggle(Number(i.id))} />
                  </td>
                  <td className="px-4 py-2.5 font-semibold">{i.prenom} {i.nom}</td>
                  <td className="px-4 py-2.5">{i.telephone}</td>
                  <td className="px-4 py-2.5"><Badge tone="blue">{i.statut}</Badge></td>
                </tr>
              ))}
            </Table>
          </div>
        )}
      </Card>

      <div className="space-y-5">
        <Card title="Message à envoyer" icon="✉️">
          <Field label="Modèle">
            <select
              className={inputCls}
              value={template}
              onChange={(e) => {
                setTemplate(e.target.value);
                const t = TEMPLATES.find((t) => t.key === e.target.value);
                if (t) setMessage(t.text);
              }}
            >
              {TEMPLATES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </Field>
          <div className="mt-3">
            <Field label="Message ({prenom} = prénom du destinataire)">
              <textarea
                className={`${inputCls} h-32 resize-none`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Field>
          </div>
          <div className="mt-4 flex justify-end">
            <Btn variant="success" onClick={envoyer} disabled={selected.size === 0}>
              📤 Envoyer à {selected.size} destinataire(s)
            </Btn>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            L'envoi ouvre WhatsApp (wa.me) pour chaque destinataire sélectionné.
          </p>
        </Card>

        <Card title="Historique des envois" icon="📜">
          {historique.length === 0 ? <Empty text="Aucun envoi enregistré." /> : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {historique.map((h, idx) => (
                <div key={idx} className="border border-slate-100 rounded-lg p-3 text-sm">
                  <p className="text-xs text-slate-400">{h.date} — {h.destinataires} destinataire(s)</p>
                  <p className="text-slate-700 mt-1">{h.message}…</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
