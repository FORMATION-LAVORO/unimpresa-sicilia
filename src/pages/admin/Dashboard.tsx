import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate, Navigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { getAdminToken, getAdminUser, clearAdminSession } from "@/lib/adminAuth";
import DashboardHome from "./sections/DashboardHome";
import AdminsSection from "./sections/AdminsSection";
import RendezVousSection from "./sections/RendezVousSection";
import WhatsAppSection from "./sections/WhatsAppSection";
import ParametresSection from "./sections/ParametresSection";
import FormationsSection from "./sections/FormationsSection";
import CentresSection from "./sections/CentresSection";
import TuteursSection from "./sections/TuteursSection";
import ApprenantsSection from "./sections/ApprenantsSection";
import ComptabiliteSection from "./sections/ComptabiliteSection";
import PaiementsSection from "./sections/PaiementsSection";
import RapportsSection from "./sections/RapportsSection";
import MatchingSection from "./sections/MatchingSection";
import EntreprisesSection from "./sections/EntreprisesSection";
import PlacementsSection from "./sections/PlacementsSection";

type NavItem = { path: string; label: string; icon: string; el: () => React.ReactNode };
type NavGroup = { title: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    title: "Principal",
    items: [
      { path: "/admin", label: "Tableau de bord", icon: "📊", el: () => <DashboardHome /> },
      { path: "/admin/admins", label: "Gestion des admins", icon: "👥", el: () => <AdminsSection /> },
      { path: "/admin/rendezvous", label: "Gestion des rendez-vous", icon: "📅", el: () => <RendezVousSection /> },
      { path: "/admin/whatsapp", label: "Communication WhatsApp", icon: "📱", el: () => <WhatsAppSection /> },
      { path: "/admin/parametres", label: "Paramètres", icon: "⚙️", el: () => <ParametresSection /> },
    ],
  },
  {
    title: "Gestion",
    items: [
      { path: "/admin/formations", label: "Formations", icon: "📚", el: () => <FormationsSection /> },
      { path: "/admin/centres", label: "Centres & salles", icon: "🏢", el: () => <CentresSection /> },
      { path: "/admin/tuteurs", label: "Tuteurs", icon: "👨‍🏫", el: () => <TuteursSection /> },
      { path: "/admin/apprenants", label: "Apprenants", icon: "👤", el: () => <ApprenantsSection /> },
    ],
  },
  {
    title: "Finances",
    items: [
      { path: "/admin/comptabilite", label: "Comptabilité", icon: "💰", el: () => <ComptabiliteSection /> },
      { path: "/admin/paiements", label: "Paiements", icon: "💳", el: () => <PaiementsSection /> },
      { path: "/admin/rapports", label: "Rapports", icon: "📈", el: () => <RapportsSection /> },
    ],
  },
  {
    title: "Recrutement",
    items: [
      { path: "/admin/matching", label: "Matching", icon: "🤝", el: () => <MatchingSection /> },
      { path: "/admin/entreprises", label: "Entreprises", icon: "🏭", el: () => <EntreprisesSection /> },
      { path: "/admin/placements", label: "Placements", icon: "📋", el: () => <PlacementsSection /> },
    ],
  },
];

const ALL = NAV.flatMap((g) => g.items);

export default function AdminDashboard() {
  const token = getAdminToken();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: alertes } = trpc.admin.alertesNonPayants.useQuery(
    { token }, { enabled: !!token, refetchInterval: 60000 },
  );

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const current = useMemo(
    () => ALL.find((i) => i.path === location.pathname) ?? ALL[0],
    [location.pathname],
  );

  if (!token) return <Navigate to="/admin/login" replace />;
  const notifCount = alertes?.length ?? 0;
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* ── Sidebar ── */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-64 bg-[#0e1830] text-white flex flex-col shrink-0 transition-transform lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-[#c9a227] flex items-center justify-center text-xl">🎓</div>
          <div>
            <p className="font-extrabold text-sm leading-tight">UNIMPRESA</p>
            <p className="text-xs text-slate-400">Sicilia — Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <div className="w-9 h-9 rounded-full bg-[#16233f] border border-[#c9a227]/50 flex items-center justify-center text-xs font-extrabold text-[#c9a227]">
            {getAdminUser().slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">{getAdminUser()}</p>
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-[#c9a227]/20 text-[#c9a227] text-[10px] font-bold uppercase">
              Admin
            </span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {NAV.map((group) => (
            <div key={group.title} className="mb-2">
              <p className="px-5 pt-3 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                {group.title}
              </p>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/admin"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-5 py-2.5 text-sm font-semibold transition border-l-4 ${
                      isActive
                        ? "bg-white/10 text-white border-[#c9a227]"
                        : "text-slate-300 border-transparent hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <span>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <button
          onClick={() => { clearAdminSession(); navigate("/admin/login"); }}
          className="flex items-center gap-3 px-5 py-4 text-sm font-semibold text-red-300 hover:bg-white/5 border-t border-white/10"
        >
          🚪 Déconnexion
        </button>
      </aside>
      {menuOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMenuOpen(false)} />
      )}

      {/* ── Contenu ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            className="lg:hidden text-slate-600 text-xl"
            onClick={() => setMenuOpen(true)}
            aria-label="Menu"
          >
            ☰
          </button>
          <div className="min-w-0">
            <h1 className="font-extrabold text-[#16233f] truncate">{current.icon} {current.label}</h1>
            <p className="text-xs text-slate-400 capitalize">{today}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live
            </span>
            <Link
              to="/admin/paiements"
              className="relative w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"
              title="Alertes paiements"
            >
              🔔
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 max-w-[1400px] w-full mx-auto">{current.el()}</main>
      </div>
    </div>
  );
}
