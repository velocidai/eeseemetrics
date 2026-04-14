import { cn } from "@/lib/utils";
import { Globe2, HouseIcon } from "lucide-react";
import { useExtracted } from "next-intl";
import { useGlobeStore } from "../globeStore";

export type MapView = "countries" | "subdivisions";

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-[24px] inline-flex items-center justify-center whitespace-nowrap rounded px-2 py-1 text-xs font-medium transition-all",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400",
        active ? "bg-neutral-800/50 text-white" : "text-neutral-200 hover:text-neutral-100 hover:bg-neutral-800/50"
      )}
    >
      {icon}
      <div className="hidden md:block">{label}</div>
    </button>
  );
}

export default function MapViewSelector() {
  const { mapView, setMapView } = useGlobeStore();
  const t = useExtracted();

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5 rounded-lg bg-neutral-900/50 backdrop-blur-sm p-0.5 border border-neutral-800/50">
        <TabButton
          active={mapView === "countries"}
          onClick={() => setMapView("countries")}
          icon={<Globe2 className="mr-1 md:opacity-60" size={14} />}
          label={t("Countries")}
        />
        <TabButton
          active={mapView === "subdivisions"}
          onClick={() => setMapView("subdivisions")}
          icon={<HouseIcon className="mr-1 md:opacity-60" size={14} />}
          label={t("Subdivisions")}
        />
      </div>
    </div>
  );
}
