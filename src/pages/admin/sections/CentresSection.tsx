import { useState } from "react";
import { Tabs } from "../ui";
import CentresList from "./CentresList";
import SallesSection from "./SallesSection";

export default function CentresSection() {
  const [tab, setTab] = useState("centres");
  return (
    <div className="space-y-5">
      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { key: "centres", label: "🏢 Centres de formation" },
          { key: "salles", label: "🏫 Salles & amphithéâtres" },
        ]}
      />
      {tab === "centres" ? <CentresList /> : <SallesSection />}
    </div>
  );
}
