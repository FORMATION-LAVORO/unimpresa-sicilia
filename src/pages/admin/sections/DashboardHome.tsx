import { useMemo, useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { getAdminToken, getAdminUser } from "@/lib/adminAuth";
import { Card, Table, Badge, Tabs, fmt, Empty } from "../ui";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from "recharts";

const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

export default function DashboardHome() {
  const token = getAdminToken();
  const [tab, setTab] = useState("tous");
  const { data: pipe } = trpc.admin.pipelineStats.useQuery({ token });
  const { data: inscriptions } = trpc.admin.listInscriptions.useQuery({ token });
  const { data: paiements } = trpc.admin.listPaiements.useQuery({ token });
  const { data: alertes } = trpc.admin.alertesNonPayants.useQuery({ token });
  const { data: salles } = trpc.admin.listSalles.useQuery({ token });
  const { data: recettes } = trpc.admin.comptaPeriode.useQuery({ token, periode: "mois" });

  const ins = inscriptions ?? [];
  const pais = paiements ?? [];

  /** Montant payé par inscription */
  const payeParInscription = useMemo(() => {
    const map = new Map<number, number>();
    for (const p of pais) {
      const id = Number(p.inscriptionId);
      map.set(id, (map.get(id) ?? 0) + Number(String(p.montantChiffres).replace(/[^\d]/g, "")) || 0);
    }
    return map;
  }, [pais]);

  const totalEncaisse = useMemo(
    () => pais.reduce((s, p) => s + (Number(String(p.montantChiffres).replace(/[^\d]/g, "")) || 0), 0),
    [pais],
  );

  const totalDu = (alertes ?? []).reduce((s, a) => s + a.reste, 0);

  const repartition = useMemo(() => {
    let payes = 0, partiels = 0, nonPayes = 0;
    for (const i of ins) {
      if (i.natureCandidat === "boursier") continue;
      const p = payeParInscription.get(Number(i.id)) ?? 0;
      const reste = (alertes ?? []).find((a) => a.id === Number(i.id));
      if (!reste) payes++;
      else if (p > 0) partiels++;
      else nonPayes++;
    }
    return [
      { name: "Payés", value: payes },
      { name: "Partiellement payés", value: partiels },
      { name: "Non payés", value: nonPayes },
    ];
  }, [ins, payeParInscription, alertes]);

  const parSemaine = useMemo(() => {
    const now = Date.now();
    const weeks = [0, 0, 0, 0];
    for (const i of ins) {
      const d = new Date(i.createdAt as unknown as string).getTime();
      const w = Math.floor((now - d) / (7 * 86400000));
      if (w >= 0 && w < 4) weeks[3 - w]++;
    }
    return weeks.map((v, idx) => ({ sem: `Sem ${idx + 1}`, inscrits: v }));
  }, [ins]);

  const recettesData = useMemo(
    () =>
      (recettes ?? [])
        .slice(0, 6)
        .reverse()
        .map((r) => ({ mois: r.periode, recettes: r.recettes })),
    [recettes],
  );

  const saturations = (salles ?? [])
    .filter((s) => Number(s.capacite) > 0 && (Number(s.occupation) / Number(s.capacite)) * 100 >= Number(s.seuilAlerte ?? 80))
    .map((s) => ({ ...s, taux: Math.round((Number(s.occupation) / Number(s.capacite)) * 100) }));

  const aujourdhui = ins.filter((i) => {
    const d = new Date(i.createdAt as unknown as string);
    const n = new Date();
    return d.toDateString() === n.toDateString();
  });

  const conversion = (pipe?.inscrits ?? 0) > 0
    ? Math.round((((pipe?.admis ?? 0)) / (pipe?.inscrits ?? 1)) * 100)
    : 0;

  const derniers = useMemo(() => {
    const rows = [...ins].sort(
      (a, b) => new Date(b.createdAt as unknown as string).getTime() - new Date(a.createdAt as unknown as string).getTime(),
    );
    const withState = rows.map((i) => {
      const alerte = (alertes ?? []).find((a) => a.id === Number(i.id));
      const paye = payeParInscription.get(Number(i.id)) ?? 0;
      const etat = i.natureCandidat === "boursier" ? "boursier" : !alerte ? "paye" : paye > 0 ? "partiel" : "impaye";
      return { ...i, etat };
    });
    if (tab === "payes") return withState.filter((r) => r.etat === "paye" || r.etat === "boursier").slice(0, 10);
    if (tab === "partiels") return withState.filter((r) => r.etat === "partiel").slice(0, 10);
    if (tab === "impayes") return withState.filter((r) => r.etat === "impaye").slice(0, 10);
    return withState.slice(0, 10);
  }, [ins, alertes, payeParInscription, tab]);

  const kpis = [
    { icon: "👥", bg: "bg-blue-50", label: "Total inscrits", value: fmt(pipe?.inscrits), sub: `${pipe?.payants ?? 0} payants · ${pipe?.boursiers ?? 0} boursiers`, tone: "text-slate-500" },
    { icon: "💰", bg: "bg-amber-50", label: "Montant encaissé", value: `${fmt(totalEncaisse)} FCFA`, sub: `${pais.length} versements`, tone: "text-green-600" },
    { icon: "⚠️", bg: "bg-red-50", label: "Pré-inscriptions non payées", value: fmt(alertes?.filter((a) => a.niveau === "jamais_payé").length), sub: `${fmt(totalDu)} FCFA dû`, tone: "text-red-600" },
    { icon: "📊", bg: "bg-indigo-50", label: "Taux de conversion", value: `${conversion} %`, sub: "admis / inscrits", tone: "text-slate-500", bar: conversion },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#16233f]">Bienvenue, {getAdminUser()}</h2>
        <p className="text-sm text-slate-500">Vue d'ensemble de l'activité de la plateforme</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className={`w-10 h-10 rounded-lg ${k.bg} flex items-center justify-center text-xl mb-3`}>{k.icon}</div>
            <p className="text-2xl font-extrabold text-[#16233f]">{k.value ?? "…"}</p>
            <p className="text-sm text-slate-500 mt-0.5">{k.label}</p>
            <p className={`text-xs font-semibold mt-1 ${k.tone}`}>{k.sub}</p>
            {k.bar !== undefined && (
              <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-[#16233f] rounded-full" style={{ width: `${k.bar}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Répartition des paiements" icon="📊">
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={repartition} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {repartition.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Inscriptions par semaine" icon="📈">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={parSemaine}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="sem" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="inscrits" fill="#16233f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Recettes par mois" icon="💰">
        <div className="h-56">
          <ResponsiveContainer>
            <AreaChart data={recettesData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip formatter={(v) => [`${fmt(Number(v))} FCFA`, "Recettes"]} />
              <Area type="monotone" dataKey="recettes" stroke="#16233f" fill="#16233f" fillOpacity={0.12} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-red-500 border border-slate-200 p-5">
          <p className="font-bold text-sm text-red-700 mb-3">🔴 Urgent : Impayés <span className="ml-1 bg-red-100 px-2 py-0.5 rounded-full text-xs">{(alertes ?? []).length}</span></p>
          <div className="space-y-2">
            {(alertes ?? []).slice(0, 5).map((a) => (
              <div key={a.id} className="text-sm">
                <p className="font-semibold text-slate-800">{a.nom}</p>
                <p className="text-xs text-red-600">{fmt(a.reste)} FCFA — {a.niveau === "jamais_payé" ? "jamais payé" : "reliquat dû"}</p>
              </div>
            ))}
            {(alertes ?? []).length === 0 && <p className="text-xs text-slate-400 italic">Aucun impayé 🎉</p>}
          </div>
          {(alertes ?? []).length > 0 && <Link to="/admin/paiements" className="text-xs font-bold text-red-700 hover:underline mt-3 inline-block">Traiter →</Link>}
        </div>
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-amber-400 border border-slate-200 p-5">
          <p className="font-bold text-sm text-amber-700 mb-3">🟡 Attention : Salles à saturation <span className="ml-1 bg-amber-100 px-2 py-0.5 rounded-full text-xs">{saturations.length}</span></p>
          <div className="space-y-2">
            {saturations.slice(0, 5).map((s) => (
              <div key={s.id} className="text-sm">
                <p className="font-semibold text-slate-800">{s.nom}</p>
                <p className="text-xs text-amber-700">Capacité : {s.capacite} / Occupation : {s.occupation} ({s.taux} %)</p>
              </div>
            ))}
            {saturations.length === 0 && <p className="text-xs text-slate-400 italic">Aucune saturation</p>}
          </div>
          <Link to="/admin/centres" className="text-xs font-bold text-amber-700 hover:underline mt-3 inline-block">Voir les salles →</Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-green-500 border border-slate-200 p-5">
          <p className="font-bold text-sm text-green-700 mb-3">🟢 Nouveaux inscrits aujourd'hui <span className="ml-1 bg-green-100 px-2 py-0.5 rounded-full text-xs">{aujourdhui.length}</span></p>
          <div className="space-y-2">
            {aujourdhui.slice(0, 5).map((i) => (
              <p key={i.id} className="text-sm font-semibold text-slate-800">{i.prenom} {i.nom}</p>
            ))}
            {aujourdhui.length === 0 && <p className="text-xs text-slate-400 italic">Aucun nouvel inscrit aujourd'hui</p>}
          </div>
        </div>
      </div>

      {/* Derniers inscrits */}
      <Card
        title="Derniers inscrits"
        icon="👥"
        actions={
          <Tabs
            active={tab}
            onChange={setTab}
            tabs={[
              { key: "tous", label: "Tous" },
              { key: "payes", label: "Payés" },
              { key: "partiels", label: "Partiels" },
              { key: "impayes", label: "Impayés" },
            ]}
          />
        }
      >
        {derniers.length === 0 ? <Empty /> : (
          <Table head={["N° dossier", "Nom", "Téléphone", "Nature", "Statut", "Paiement", ""]}>
            {derniers.map((i) => (
              <tr key={i.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-mono text-xs">{i.numeroDossier}</td>
                <td className="px-4 py-3 font-semibold">{i.prenom} {i.nom}</td>
                <td className="px-4 py-3">{i.telephone}</td>
                <td className="px-4 py-3">
                  <Badge tone={i.natureCandidat === "boursier" ? "purple" : "blue"}>{i.natureCandidat ?? "payant"}</Badge>
                </td>
                <td className="px-4 py-3">{i.statut}</td>
                <td className="px-4 py-3">
                  <Badge tone={i.etat === "paye" || i.etat === "boursier" ? "green" : i.etat === "partiel" ? "amber" : "red"}>
                    {i.etat === "paye" ? "soldé" : i.etat === "boursier" ? "boursier" : i.etat === "partiel" ? "reliquat" : "non payé"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Link to="/admin/apprenants" className="text-xs font-bold text-[#16233f] hover:underline">Dossier →</Link>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
