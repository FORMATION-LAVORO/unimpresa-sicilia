import { useState } from "react";
import { Tabs } from "../ui";
import PlacementsList from "./PlacementsList";
import VisaSection from "./VisaSection";

export default function PlacementsSection() {
  const [tab, setTab] = useState("placements");
  return (
    <div className="space-y-5">
      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { key: "placements", label: "🎯 Réussites & contrats" },
          { key: "visa", label: "🛂 Visa & Nulla Osta" },
        ]}
      />
      {tab === "placements" ? <PlacementsList /> : <VisaSection />}
    </div>
  );
}
