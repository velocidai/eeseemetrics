"use client";

import { useRef, useEffect } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat } from "ol/proj";
import "ol/ol.css";
import { useOpenLayersCountriesLayer } from "../hooks/useOpenLayersCountriesLayer";
import { useOpenLayersSubdivisionsLayer } from "../hooks/useOpenLayersSubdivisionsLayer";

interface OpenLayersMapProps {
  mapView: "countries" | "subdivisions";
}

export function OpenLayersMap({ mapView }: OpenLayersMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const mapViewRef = useRef<typeof mapView>(mapView);

  useEffect(() => {
    mapViewRef.current = mapView;
  }, [mapView]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const baseLayer = new TileLayer({
      source: new XYZ({
        url: "https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        attributions:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }),
    });

    const view = new View({
      center: fromLonLat([0, 20]),
      zoom: 1,
      minZoom: 0.5,
      maxZoom: 18,
    });

    const map = new Map({
      target: mapRef.current,
      layers: [baseLayer],
      view,
      controls: [],
    });

    map.once("postrender", () => {
      view.fit(
        [-20037508.342789244, -20037508.342789244, 20037508.342789244, 20037508.342789244],
        { padding: [10, 10, 10, 10] }
      );
    });

    mapInstanceRef.current = map;

    return () => {
      map.setTarget(undefined);
      mapInstanceRef.current = null;
    };
  }, []);

  useOpenLayersCountriesLayer({ mapInstanceRef, mapViewRef, mapView });
  useOpenLayersSubdivisionsLayer({ mapInstanceRef, mapViewRef, mapView });

  return <div ref={mapRef} className="w-full h-full" />;
}
