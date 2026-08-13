import { useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate, Navigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { getAdminToken, getAdminUser, clearAdminSession } from "@/lib/adminAuth";
import CyclesSection from "./sections/CyclesSection";
import FilieresSection from "./sections/FilieresSection";
import TarifsSection from "./sections/TarifsSection";
import EtapesSection from "./sections/EtapesSection";
import ParametresSection from "./sections/ParametresSection";
import InscriptionsSection from "./sections/InscriptionsSection";
import PartenairesSection from "./sections/PartenairesSection";
import AvantagesSection from "./sections/AvantagesSection";
import RendezVousSection from "./sections/RendezVousSection";

const NAV = [
  { path: "/admin/dashboard", label: "📊 Tableau de bord", key: "dashboard" },
  { path: "/admin/cycles", label: "🗓️ Cycles", key: "cycles" },
  { path: "/admin/filieres", label: "📚 Filières", key: "filieres" },
  { path: "/admin/tarifs", label: "💰 Tarifs", key: "tarifs" },
  { path: "/admin/etapes", label: "🪜 Déroulement", key: "etapes" },
  { path: "/admin/partenaires", label: "🤝 Partenaires", key: "partenaires" },
  { path: "/admin/avantages", label: "⭐ Avantages", key: "avantages" },
  { path: "/admin/inscriptions", label: "📝 Inscriptions", key: "inscriptions" },
  { path: "/admin/rendezvous", label: "📅 Rendez-vous", key: "rendezvous" },
  { path: "/admin/parametres", label: "⚙️ Paramètres", key: "parametres" },
];

function StatsHome() {
  const token = getAdminToken();
  const { data } = trpc.admin.stats.useQuery({ token });
  const cards = [
    { label: "Cycles", value: data?.cycles, icon: "🗓️", to: "/admin/cycles" },
    { label: "Filières", value: data?.filieres, icon: "📚", to: "/admin/filieres" },
    { label: "Lignes de tarifs", value: data?.tarifs, icon: "💰", to: "/admin/tarifs" },
    { label: "Étapes", value: data?.etapes, icon: "🪜", to: "/admin/etapes" },
    { label: "Inscriptions", value: data?.inscriptions, icon: "📝", to: "/admin/inscriptions" },
    { label: "Paramètres", value: data?.parametres, icon: "⚙️", to: "/admin/parametres" },
  ];
  return (
    <section>
      <h2 className="text-xl font-extrabold text-[#1a2a4a] mb-2">Bienvenue, {getAdminUser()} 👋</h2>
      <p className="text-sm text-slate-500 mb-6">
        Gérez tout le contenu du site public sans toucher au code. Chaque modification est visible immédiatement sur le site.
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition">
            <div className="text-3xl">{c.icon}</div>
            <div className="mt-2 text-3xl font-extrabold text-[#1a2a4a]">{c.value ?? "…"}</div>
            <div className="text-sm text-slate-500 font-semibold">{c.label}</div>
          </Link>
        ))}
      </div>
      <div className="mt-6 bg-[#1a2a4a] rounded-xl p-5 text-white flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-bold">Voir le site public</div>
          <div className="text-white/60 text-sm">Vérifiez vos modifications en temps réel.</div>
        </div>
        <Link to="/" className="px-5 py-2.5 rounded-lg bg-[#c9a227] text-[#0f1f2e] font-bold text-sm hover:brightness-110 transition">
          🌐 Ouvrir le site
        </Link>
      </div>
    </section>
  );
}

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = getAdminToken();
  const key = NAV.find((n) => location.pathname.startsWith(n.path))?.key ?? "dashboard";

  useEffect(() => {
    if (!token) navigate("/admin/login", { replace: true });
  }, [token, navigate]);

  if (!token) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="md:w-64 bg-[#0f1f2e] text-white md:min-h-screen shrink-0">
        <div className="p-4 flex items-center gap-2.5 border-b border-white/10">
          <span className="w-9 h-9 rounded-full bg-[#c9a227] flex items-center justify-center text-lg">🎓</span>
          <div className="min-w-0">
            <div className="font-extrabold leading-tight truncate">UNIMPRESA Sicilia</div>
            <div className="text-[11px] text-[#c9a227] font-bold tracking-wide uppercase">Super Admin</div>
          </div>
        </div>
        <nav className="p-3 flex md:flex-col gap-1 overflow-x-auto">
          {NAV.map((n) => (
            <NavLink
              key={n.key}
              to={n.path}
              className={`px-3 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                key === n.key ? "bg-[#c9a227] text-[#0f1f2e]" : "text-white/70 hover:bg-white/10"
              }`}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 md:mt-auto border-t border-white/10 flex md:flex-col gap-2">
          <Link to="/" className="px-3 py-2 rounded-lg text-sm text-white/60 hover:bg-white/10 transition">🌐 Site public</Link>
          <button
            onClick={() => { clearAdminSession(); navigate("/admin/login"); }}
            className="px-3 py-2 rounded-lg text-sm text-red-300 hover:bg-white/10 text-left transition"
          >
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      {/* Contenu */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
        {key === "dashboard" && <StatsHome />}
        {key === "cycles" && <CyclesSection />}
        {key === "filieres" && <FilieresSection />}
        {key === "tarifs" && <TarifsSection />}
        {key === "etapes" && <EtapesSection />}
        {key === "partenaires" && <PartenairesSection />}
        {key === "avantages" && <AvantagesSection />}
        {key === "inscriptions" && <InscriptionsSection />}
        {key === "rendezvous" && <RendezVousSection />}
        {key === "parametres" && <ParametresSection />}
      </main>
    </div>
  );
}
