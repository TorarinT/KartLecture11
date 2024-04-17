import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import React, { MutableRefObject, useEffect, useRef } from "react";
import { useGeographic } from "ol/proj";
import "ol/ol.css";
useGeographic();
const map = new Map({
  view: new View({ center: [10, 63], zoom: 10 }),
  layers: [new TileLayer({ source: new OSM() })],
});
export function TransitMapApplication() {
  const mapRef = useRef() as MutableRefObject<HTMLDivElement>;
  useEffect(() => {
    map.setTarget(mapRef.current);
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
    </div>
  );
}
