import type { ReactNode } from "react";
import { trpc } from "@/providers/trpc";
import { getAdminToken } from "@/lib/adminAuth";

export const ACCENT = "#c9a227";
export const PRIMAIRE = "#1a2a4a";

export const inputCls =
  "w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a227] bg-white";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">{label}</span>
      {children}
    </label>
  );
}

export function Btn({
  children, onClick, type = "button", variant = "primary", disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "gold" | "danger" | "ghost";
  disabled?: boolean;
}) {
  const styles = {
    primary: "bg-[#1a2a4a] text-white hover:brightness-110",
    gold: "bg-[#c9a227] text-[#0f1f2e] hover:brightness-110 font-bold",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 ${styles}`}
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

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            {head.map((h, i) => (
              <th key={i} className="px-4 py-3 font-bold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
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

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full relative transition ${checked ? "bg-green-500" : "bg-slate-300"}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? "left-5.5 left-[22px]" : "left-0.5"}`}
      />
    </button>
  );
}
