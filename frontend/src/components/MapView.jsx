import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

function Fly({ pos }) {
  const map = useMap();
  if (pos) map.flyTo(pos, 13, { duration: 1 });
  return null;
}

const MapView = forwardRef(function MapView({ destination, days, lat, lng }, ref) {
  const center = useMemo(() => lat && lng ? [lat, lng] : [18.52, 73.85], [lat, lng]);
  const markRef = useRef({});
  const pins = useMemo(() => {
    const out = [];
    (days || []).forEach((d) =>
      ["morning", "afternoon", "evening"].forEach((p) =>
        (d[p] || []).forEach((a, ai) => {
          out.push({ ...a, day: d.day, pos: a.latitude && a.longitude ? [a.latitude, a.longitude]
            : [center[0] + (d.day * 0.018 + ai * 0.009) - 0.035, center[1] + (ai * 0.016) - 0.022] });
        })
      )
    );
    return out.slice(0, 30);
  }, [days, center]);

  useImperativeHandle(ref, () => ({
    locate: (a) => {
      const hit = pins.find((p) => (p.id || p.title) === (a.id || a.title));
      if (hit) setFly(hit.pos);
    },
  }));
  const [fly, setFly] = useState(null);

  return (
    <div className="card" style={{ padding: 12 }}>
      <h3 style={{ padding: "4px 8px 10px" }}>🗺️ {destination} on the map</h3>
      <MapContainer center={center} zoom={11} style={{ height: 360, width: "100%" }} scrollWheelZoom={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
        <Fly pos={fly} />
        {pins.map((p, i) => (
          <Marker key={i} position={p.pos} ref={(m) => { if (m) markRef.current[p.title] = m; }}>
            <Popup><strong>Day {p.day} · {p.title}</strong><br />{p.category}<br />{p.description}<br />≈ ₹{Number(p.estimated_cost || 0).toLocaleString("en-IN")}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
});

export default MapView;
