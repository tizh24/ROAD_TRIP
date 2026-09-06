"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { previewRoute } from "@/features/trip-planning/api/trips";

type Stop = { id: string; name: string; latitude: number; longitude: number };
const marker = L.divIcon({ className: "route-marker", html: "●", iconSize: [16, 16], iconAnchor: [8, 8] });
function Fit({ points }: { points: [number, number][] }) { const map = useMap(); useEffect(() => { if (points.length) map.fitBounds(points, { padding: [24, 24] }); }, [map, points]); return null; }
export default function RouteMap({ stops }: { stops: readonly Stop[] }) {
  const points = stops.map((stop) => [stop.latitude, stop.longitude] as [number, number]);
  const [route, setRoute] = useState<[number, number][]>([]); const [summary, setSummary] = useState<string>();
  useEffect(() => { if (points.length < 2) { setRoute([]); setSummary(undefined); return; } let active = true; previewRoute(stops.map(({ latitude, longitude }) => ({ latitude, longitude }))).then((result) => { if (active) { setRoute(result.geometry.coordinates.map(([lng, lat]) => [lat, lng])); setSummary(`${Math.round(result.distanceMeters / 1000)} km · ${Math.round(result.durationSeconds / 60)} phút`); } }).catch(() => { if (active) setSummary("Không thể tải tuyến đường; itinerary vẫn được lưu."); }); return () => { active = false; }; }, [stops, points.length]);
  if (!points.length) return <div className="h-64 rounded-xl bg-gray-100 p-6 text-sm text-gray-600">Thêm ít nhất một điểm dừng để xem bản đồ.</div>;
  return <div><div className="h-64 overflow-hidden rounded-xl"><MapContainer center={points[0]} zoom={10} className="h-full w-full"><TileLayer attribution="© OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><Fit points={points} />{stops.map((stop) => <Marker key={stop.id} position={[stop.latitude, stop.longitude]} icon={marker} title={stop.name} />)}{route.length > 1 && <Polyline positions={route} pathOptions={{ color: "#E07A5F", weight: 5 }} />}</MapContainer></div>{summary && <p className="mt-2 text-sm text-gray-600">{summary}</p>}</div>;
}
