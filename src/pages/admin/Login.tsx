import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { setAdminSession } from "@/lib/adminAuth";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = trpc.admin.login.useMutation();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login.mutateAsync({ username: email.trim(), password });
      setAdminSession(res.token, res.username ?? email.trim());
      navigate("/admin");
    } catch {
      setError("Identifiants incorrects. Vérifiez votre email et votre mot de passe.");
    }
  };

  const features = [
    { icon: "📚", text: "Gestion des formations et apprenants" },
    { icon: "💰", text: "Suivi comptable et paiements" },
    { icon: "🤝", text: "Matching apprenants / entreprises" },
    { icon: "📊", text: "Statistiques et rapports" },
  ];

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Panneau de marque */}
      <div className="hidden lg:flex flex-col justify-center w-[42%] bg-[#0e1830] text-white p-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#c9a227] flex items-center justify-center text-2xl">🎓</div>
          <div>
            <p className="font-extrabold text-lg leading-tight">UNIMPRESA Sicilia</p>
            <p className="text-xs text-slate-400">Administration</p>
          </div>
        </div>
        <h1 className="text-2xl font-extrabold mb-3 leading-snug">
          Plateforme d'administration pour la gestion des formations certifiées Sénégal → Italie.
        </h1>
        <div className="mt-8 space-y-4">
          {features.map((f) => (
            <div key={f.text} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
              <span className="text-xl">{f.icon}</span>
              <span className="text-sm font-semibold text-slate-200">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Formulaire */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-6 justify-center">
            <div className="w-10 h-10 rounded-xl bg-[#c9a227] flex items-center justify-center text-xl">🎓</div>
            <p className="font-extrabold text-[#16233f]">UNIMPRESA Sicilia</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <h2 className="text-xl font-extrabold text-[#16233f]">Connexion Admin</h2>
            <p className="text-sm text-slate-500 mb-6">Accédez à votre espace de gestion</p>
            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Email</span>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@unimpresa.it"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a227]"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Mot de passe</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a227]"
                />
              </label>
              {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
              <button
                type="submit"
                disabled={login.isPending}
                className="w-full py-3 rounded-lg bg-[#16233f] text-white font-bold hover:brightness-125 transition disabled:opacity-50"
              >
                {login.isPending ? "Connexion…" : "Se connecter"}
              </button>
            </form>
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs font-bold text-blue-900 mb-1">🔒 Sécurité renforcée</p>
              <ul className="text-xs text-blue-800 space-y-0.5 list-disc list-inside">
                <li>Session sécurisée par jeton JWT (12 h)</li>
                <li>Mots de passe chiffrés (bcrypt)</li>
                <li>Journal d'audit des opérations sensibles</li>
              </ul>
            </div>
          </div>
          <p className="text-center mt-6 text-sm">
            <Link to="/" className="text-slate-500 hover:text-[#16233f] font-semibold">← Retour au site</Link>
          </p>
          <p className="text-center mt-4 text-xs text-slate-400">© 2026 UNIMPRESA Sicilia. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
}
