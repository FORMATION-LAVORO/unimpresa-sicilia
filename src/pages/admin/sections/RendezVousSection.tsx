import { trpc } from "@/providers/trpc";
import { useAdmin, Btn, Table } from "../ui";

const STATUTS = ["nouveau", "confirmé", "honoré", "annulé"];
const STYLE: Record<string, string> = {
  nouveau: "bg-blue-100 text-blue-700",
  confirmé: "bg-green-100 text-green-700",
  honoré: "bg-emerald-100 text-emerald-800",
  annulé: "bg-red-100 text-red-700",
};

export default function RendezVousSection() {
  const { token, refresh } = useAdmin();
  const { data } = trpc.admin.listRendezVous.useQuery({ token });
  const update = trpc.admin.updateRendezVous.useMutation({ onSuccess: refresh });
  const del = trpc.admin.deleteRendezVous.useMutation({ onSuccess: refresh });

  return (
    <section>
      <h2 className="text-xl font-extrabold text-[#1a2a4a] mb-4">Rendez-vous ({data?.length ?? 0})</h2>
      <Table head={["Date demande", "Visiteur", "Contact", "Motif", "Date souhaitée", "Statut", "Actions"]}>
        {(data ?? []).map((r) => (
          <tr key={r.id} className="border-t border-slate-100">
            <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString("fr-FR")}</td>
            <td className="px-4 py-3 font-bold text-[#1a2a4a] whitespace-nowrap">{r.prenom} {r.nom}</td>
            <td className="px-4 py-3">
              <div>{r.telephone}</div>
              <div className="text-xs text-slate-500">{r.email}</div>
            </td>
            <td className="px-4 py-3 max-w-56 truncate">{r.motif}</td>
            <td className="px-4 py-3">{r.dateSouhaitee || "—"}</td>
            <td className="px-4 py-3">
              <select
                className={`text-xs font-bold px-2.5 py-1.5 rounded-full border-0 cursor-pointer ${STYLE[r.statut] ?? "bg-slate-100"}`}
                value={r.statut}
                onChange={(e) => update.mutate({ token, id: Number(r.id), statut: e.target.value })}
              >
                {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </td>
            <td className="px-4 py-3">
              <Btn variant="danger" onClick={() => confirm("Supprimer ce rendez-vous ?") && del.mutate({ token, id: Number(r.id) })}>🗑</Btn>
            </td>
          </tr>
        ))}
        {(data ?? []).length === 0 && (
          <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Aucune demande de rendez-vous.</td></tr>
        )}
      </Table>
    </section>
  );
}
