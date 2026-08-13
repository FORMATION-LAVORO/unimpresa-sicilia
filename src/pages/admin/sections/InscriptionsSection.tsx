import { trpc } from "@/providers/trpc";
import { useAdmin, Btn, Table } from "../ui";

const STATUTS = ["nouveau", "contacté", "confirmé", "payé", "refusé"];
const STATUT_STYLE: Record<string, string> = {
  nouveau: "bg-blue-100 text-blue-700",
  contacté: "bg-amber-100 text-amber-700",
  confirmé: "bg-green-100 text-green-700",
  payé: "bg-emerald-100 text-emerald-800",
  refusé: "bg-red-100 text-red-700",
};

export default function InscriptionsSection() {
  const { token, refresh } = useAdmin();
  const { data } = trpc.admin.listInscriptions.useQuery({ token });
  const update = trpc.admin.updateInscription.useMutation({ onSuccess: refresh });
  const del = trpc.admin.deleteInscription.useMutation({ onSuccess: refresh });

  return (
    <section>
      <h2 className="text-xl font-extrabold text-[#1a2a4a] mb-4">
        Inscriptions candidats ({data?.length ?? 0})
      </h2>
      <Table head={["Dossier", "Date", "Candidat", "Contact", "Filière / Métier", "Détails", "Statut", "Actions"]}>
        {(data ?? []).map((i) => (
          <tr key={i.id} className="border-t border-slate-100">
            <td className="px-4 py-3 font-mono font-bold text-[#8a6d1a] whitespace-nowrap">{i.numeroDossier || "—"}</td>
            <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
              {new Date(i.createdAt).toLocaleDateString("fr-FR")}
            </td>
            <td className="px-4 py-3 font-bold text-[#1a2a4a] whitespace-nowrap">
              {i.prenom} {i.nom}
              <div className="text-xs font-normal text-slate-500">{i.sexe} · {i.situationFamiliale}</div>
            </td>
            <td className="px-4 py-3">
              <div className="text-slate-700">{i.email}</div>
              <div className="text-slate-500 text-xs">{i.telephone}</div>
            </td>
            <td className="px-4 py-3">
              <div className="font-semibold">{i.filiereLabel}</div>
              <div className="text-xs text-slate-500">{i.metierChoisi}</div>
            </td>
            <td className="px-4 py-3 text-xs text-slate-500 max-w-56">
              {i.enActivite && <div>Activité : {i.enActivite}{i.profession ? ` (${i.profession})` : ""}</div>}
              {i.dateNaissance && <div>Né(e) le {i.dateNaissance}{i.lieuNaissance ? ` à ${i.lieuNaissance}` : ""}</div>}
              {i.urgenceNom && <div>Urgence : {i.urgenceNom} {i.urgenceTelephone}</div>}
              <div>{i.cycleLabel}</div>
            </td>
            <td className="px-4 py-3">
              <select
                className={`text-xs font-bold px-2.5 py-1.5 rounded-full border-0 cursor-pointer ${STATUT_STYLE[i.statut] ?? "bg-slate-100"}`}
                value={i.statut}
                onChange={(e) => update.mutate({ token, id: Number(i.id), statut: e.target.value })}
              >
                {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </td>
            <td className="px-4 py-3">
              <Btn variant="danger" onClick={() => confirm("Supprimer cette inscription ?") && del.mutate({ token, id: Number(i.id) })}>🗑</Btn>
            </td>
          </tr>
        ))}
        {(data ?? []).length === 0 && (
          <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">Aucune inscription pour le moment.</td></tr>
        )}
      </Table>
    </section>
  );
}
