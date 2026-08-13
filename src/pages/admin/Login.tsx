import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { setAdminSession } from "@/lib/adminAuth";

export default function AdminLogin() {
  const navigate = useNavigate();
  const login = trpc.admin.login.useMutation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login.mutateAsync({ username, password });
      setAdminSession(res.token, res.username);
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Connexion impossible.");
    }
  };

  const input =
    "w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#c9a227] bg-white";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0f1f2e]">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <span className="inline-flex w-14 h-14 rounded-full items-center justify-center text-2xl bg-[#1a2a4a]">🔐</span>
            <h1 className="mt-3 text-2xl font-extrabold text-[#1a2a4a]">Super Admin</h1>
            <p className="mt-1 text-sm text-slate-500">UNIMPRESA Sicilia — Panneau d'administration</p>
          </div>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nom d'utilisateur</label>
              <input required className={input} value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Mot de passe</label>
              <input required type="password" className={input} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
            {error && <p className="text-sm font-semibold text-red-600 bg-red-50 rounded-lg px-4 py-2.5">{error}</p>}
            <button
              type="submit"
              disabled={login.isPending}
              className="w-full py-3.5 rounded-xl font-bold text-[#0f1f2e] bg-[#c9a227] hover:brightness-110 transition disabled:opacity-60"
            >
              {login.isPending ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center">
          <Link to="/" className="text-white/50 hover:text-white text-sm">← Retour au site public</Link>
        </p>
      </div>
    </div>
  );
}
