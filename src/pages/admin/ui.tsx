import type { ReactNode } from "react";
import { trpc } from "@/providers/trpc";
import { getAdminToken } from "@/lib/adminAuth";

export const NAVY = "#16233f";
export const NAVY_DARK = "#0e1830";
export const GOLD = "#c9a227";

export const inputCls =
  "w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a227] bg-white";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">{label}</span>
      {children}
    </label>
  );
}

export function Btn({
  children, onClick, type = "button", variant = "primary", disabled, small,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "gold" | "danger" | "ghost" | "success";
  disabled?: boolean;
  small?: boolean;
}) {
  const styles = {
    primary: "bg-[#16233f] text-white hover:brightness-125",
    gold: "bg-[#c9a227] text-[#0e1830] hover:brightness-110 font-bold",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    ghost: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${small ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm"} rounded-lg font-semibold transition disabled:opacity-50 ${styles}`}
    >
      {children}
    </button>
  );
}

/** Hook utilitaire : token admin + invalidation des caches après mutation */
export function useAdmin() {
  const token = getAdminToken();
  const utils = trpc.useUtils();
  const refresh = () => utils.invalidate();
  return { token, refresh };
}

export function Card({ title, icon, actions, children, className = "" }: {
  title?: string; icon?: string; actions?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm">{icon && <span className="mr-2">{icon}</span>}{title}</h3>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            {head.map((h, i) => (
              <th key={i} className="px-4 py-3 font-bold whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Badge({ tone = "slate", children }: {
  tone?: "green" | "amber" | "red" | "blue" | "slate" | "purple"; children: ReactNode;
}) {
  const tones = {
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    slate: "bg-slate-100 text-slate-600",
  }[tone];
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${tones}`}>{children}</span>;
}

export function Modal({ title, onClose, children, wide }: {
  title: string; onClose: () => void; children: ReactNode; wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Tabs({ tabs, active, onChange }: {
  tabs: { key: string; label: string; count?: number }[]; active: string; onChange: (k: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 bg-slate-100 rounded-lg p-1 w-fit">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
            active === t.key ? "bg-white text-[#16233f] shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {t.label}{t.count !== undefined && <span className="ml-1 text-slate-400">({t.count})</span>}
        </button>
      ))}
    </div>
  );
}

/** Bouton d'export Excel : télécharge un jeu de données via /api/export/:name */
export function ExportBtn({ dataset, label }: { dataset: string; label?: string }) {
  const token = getAdminToken();
  return (
    <a
      href={`/api/export/${dataset}?token=${encodeURIComponent(token)}`}
      className="px-4 py-2 rounded-lg text-sm font-semibold transition bg-green-700 text-white hover:bg-green-800 inline-block"
    >
      📊 {label ?? "Exporter Excel"}
    </a>
  );
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full relative transition ${checked ? "bg-green-500" : "bg-slate-300"}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`}
      />
    </button>
  );
}

export function fmt(n?: number | null) {
  return (n ?? 0).toLocaleString("fr-FR");
}

export function Empty({ text = "Aucune donnée pour le moment." }: { text?: string }) {
  return <p className="text-sm text-slate-400 italic py-6 text-center">{text}</p>;
}
