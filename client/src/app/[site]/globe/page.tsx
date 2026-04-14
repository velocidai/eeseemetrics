"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import "./globe.css";

import { useSetPageTitle } from "../../../hooks/useSetPageTitle";
import { SubHeader } from "../components/SubHeader/SubHeader";
import { GlobeSessions } from "./components/GlobeSessions";
import { GlobeCountriesPanel } from "./components/GlobeCountriesPanel";
import MapViewSelector from "./components/ModeSelector";
import { OpenLayersMap } from "./2d/components/OpenLayersMap";
import { useGlobeStore } from "./globeStore";
import { useShallow } from "zustand/react/shallow";

export default function GlobePage() {
  useSetPageTitle("Globe");

  const { mapView } = useGlobeStore(
    useShallow(s => ({ mapView: s.mapView }))
  );

  return (
    <div className="flex flex-col">
      {/* ── SubHeader ────────────────────────────────────── */}
      <div className="p-2 md:p-4">
        <SubHeader pageInfo="globe" />
      </div>

      {/* ── Map ─────────────────────────────────────────── */}
      <div className="relative h-[calc(100vh-280px)] min-h-[400px]">
        <div className="absolute inset-0">
          <OpenLayersMap mapView={mapView} />
        </div>

        {/* Controls overlaid at the bottom */}
        <div className="absolute bottom-2 left-2 right-2 z-30 flex items-end gap-2 justify-between pointer-events-none">
          <div className="pointer-events-auto dark">
            <MapViewSelector />
          </div>
          <div className="pointer-events-auto hidden md:block dark">
            <GlobeSessions />
          </div>
        </div>
      </div>

      {/* ── Countries below map ──────────────────────────── */}
      <GlobeCountriesPanel />
    </div>
  );
}
