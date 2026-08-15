import { useState } from "react";
import { Tabs } from "../ui";
import InscriptionsSection from "./InscriptionsSection";
import TravailleursSection from "./TravailleursSection";

export default function ApprenantsSection() {
  const [tab, setTab] = useState("inscriptions");
  return (
    <div className="space-y-5">
      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { key: "inscriptions", label: "📝 Inscriptions" },
          { key: "travailleurs", label: "👷 Travailleurs" },
        ]}
      />
      {tab === "inscriptions" ? <InscriptionsSection /> : <TravailleursSection />}
    </div>
  );
}
