import { useState } from "react";
import { Tabs } from "../ui";
import PartenairesSection from "./PartenairesSection";
import AvantagesSection from "./AvantagesSection";

export default function EntreprisesSection() {
  const [tab, setTab] = useState("partenaires");
  return (
    <div className="space-y-5">
      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { key: "partenaires", label: "🏭 Entreprises & partenaires" },
          { key: "avantages", label: "⭐ Avantages" },
        ]}
      />
      {tab === "partenaires" ? <PartenairesSection /> : <AvantagesSection />}
    </div>
  );
}
