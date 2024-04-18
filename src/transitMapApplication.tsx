import { Feature, Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import React, {
  MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useGeographic } from "ol/proj";
import "ol/ol.css";
import { FeedMessage, VehiclePosition } from "../generated/gtfs-realtime";
import { Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
useGeographic();

const vehicleSource = new VectorSource();
const vehicleLayer = new VectorLayer({ source: vehicleSource });
const backgroundLayer = new TileLayer({ source: new OSM() });

const map = new Map({
  view: new View({ center: [10, 63], zoom: 10 }),
});

interface SusVehicle {
  routeId: string;
  coordinate: number[];
}

function convertFromProtobuf(
  vehicle: VehiclePosition | undefined,
): SusVehicle | undefined {
  if (!vehicle) return;
  vehicle.position;
  const { position, trip } = vehicle;
  if (!position || !trip) return;
  const { latitude, longitude } = position;
  const { routeId } = trip;
  if (!routeId) return;
  return {
    routeId,
    coordinate: [longitude, latitude],
  };
}

export function TransitMapApplication() {
  const [vehicleSource, setVehicleSource] = useState<VectorSource>();
  const vehicleLayer = useMemo(
    () => new VectorLayer({ source: vehicleSource }),
    [vehicleSource],
  );
  const layers = useMemo(() => {
    return [backgroundLayer, vehicleLayer];
  }, [vehicleLayer]);

  useEffect(() => {
    map.setLayers(layers);
  }, [layers]);
  async function fetchVehiclePosition() {
    const res = await fetch(
      "https://api.entur.io/realtime/v1/gtfs-rt/vehicle-positions",
    );
    if (!res.ok) {
      throw `error fetching ${res.url}: ${res.statusText}`;
    }
    const responseMessage = FeedMessage.decode(
      new Uint8Array(await res.arrayBuffer()),
    );
    console.log(responseMessage);

    const vehicles: SusVehicle[] = [];
    for (const { vehicle } of responseMessage.entity) {
      const v = convertFromProtobuf(vehicle);
      if (v) vehicles.push(v);
    }

    setVehicleSource(
      new VectorSource({
        features: vehicles.map((v) => new Feature(new Point(v.coordinate))),
      }),
    );
  }

  useEffect(() => {
    fetchVehiclePosition();
  }, []);

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