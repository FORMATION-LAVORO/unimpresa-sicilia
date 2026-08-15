import { useState } from "react";
import { Tabs } from "../ui";
import CyclesSection from "./CyclesSection";
import FilieresSection from "./FilieresSection";
import TarifsSection from "./TarifsSection";
import EtapesSection from "./EtapesSection";
import FormationSection from "./FormationSection";

export default function FormationsSection() {
  const [tab, setTab] = useState("cycles");
  return (
    <div className="space-y-5">
      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { key: "cycles", label: "🗓️ Cycles" },
          { key: "filieres", label: "📚 Filières" },
          { key: "tarifs", label: "💰 Tarifs" },
          { key: "etapes", label: "🪜 Déroulement" },
          { key: "modules", label: "📖 Modules & progression" },
        ]}
      />
      {tab === "cycles" && <CyclesSection />}
      {tab === "filieres" && <FilieresSection />}
      {tab === "tarifs" && <TarifsSection />}
      {tab === "etapes" && <EtapesSection />}
      {tab === "modules" && <FormationSection />}
    </div>
  );
}
