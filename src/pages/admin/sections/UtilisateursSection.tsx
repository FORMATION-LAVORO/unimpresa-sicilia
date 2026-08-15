import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAdmin, Field, Btn, Table, inputCls } from "../ui";

const ROLES = [
  { value: "superadmin", label: "👑 Admin général (accès total)" },
  { value: "comptable", label: "🧾 Comptable (paiements & comptabilité)" },
  { value: "operateur", label: "🖥️ Opérateur (saisie quotidienne)" },
];

export default function UtilisateursSection() {
  const { token, refresh } = useAdmin();
  const { data: admins } = trpc.admin.listAdmins.useQuery({ token });
  const create = trpc.admin.createAdmin.useMutation({ onSuccess: refresh });
  const updateRole = trpc.admin.updateAdminRole.useMutation({ onSuccess: refresh });
  const del = trpc.admin.deleteAdmin.useMutation({ onSuccess: refresh });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("operateur");
  const [showForm, setShowForm] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({ token, username, password, role });
    setUsername(""); setPassword(""); setRole("operateur"); setShowForm(false);
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-extrabold text-[#1a2a4a]">🔐 Utilisateurs du back-office</h2>
        <Btn variant="gold" onClick={() => setShowForm(!showForm)}>{showForm ? "Fermer" : "+ Nouveau compte"}</Btn>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Trois niveaux : <b>Admin général</b> (tout), <b>Comptable</b> (paiements, comptabilité, exports), <b>Opérateur</b> (saisie des inscriptions et données quotidiennes).
      </p>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 grid sm:grid-cols-2 gap-4">
          <Field label="Identifiant"><input required minLength={3} className={inputCls} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="comptable1" /></Field>
          <Field label="Mot de passe"><input required minLength={6} type="text" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="min. 6 caractères" /></Field>
          <Field label="Rôle">
            <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </Field>
          <div className="flex gap-2 sm:justify-end items-end">
            <Btn type="submit" variant="gold">Créer le compte</Btn>
          </div>
        </form>
      )}

      <Table head={["Identifiant", "Rôle", "Actions"]}>
        {(admins ?? []).map((a) => (
          <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50">
            <td className="px-4 py-3 font-semibold">{a.username}</td>
            <td className="px-4 py-3">
              <select className="text-xs font-bold rounded-lg border border-slate-300 px-2 py-1" value={a.role}
                onChange={(e) => updateRole.mutate({ token, id: a.id, role: e.target.value })}>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </td>
            <td className="px-4 py-3">
              <button className="text-red-600 font-bold text-xs" onClick={() => { if (confirm(`Supprimer le compte « ${a.username} » ?`)) del.mutate({ token, id: a.id }); }}>🗑️</button>
            </td>
          </tr>
        ))}
      </Table>
    </section>
  );
}
