// src/pages/LocationsMap.jsx
import React, { useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix de iconos de Leaflet para que funcionen con Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/**
 * Este estado inicial está vacío a propósito.
 * El backend debería alimentar este array con algo como:
 *
 * {
 *   id: string | number,
 *   nombre: string,
 *   lat: number,
 *   lng: number,
 *   estrato: 1 | 2 | 3 | 4 | 5 | 6,
 *   consumo: "Alto" | "Medio" | "Bajo",
 *   barrio?: string,
 *   ciudad?: string,
 *   descripcion?: string
 * }
 */
const initialLocations = [];

export default function LocationsMap() {
  // Aquí luego puedes reemplazar esto por datos que vengan de una API
  const [locations] = useState(initialLocations);

  const [selectedEstrato, setSelectedEstrato] = useState("Todos");
  const [selectedConsumo, setSelectedConsumo] = useState("Todos");

  // Centro inicial del mapa (ejemplo genérico, ajusta a tu zona de operación)
  const defaultCenter = [4.142, -73.629]; // Villavicencio aprox.
  const defaultZoom = 11;

  // Lista filtrada según estrato y consumo
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchEstrato =
        selectedEstrato === "Todos" ||
        String(loc.estrato) === String(selectedEstrato);

      const matchConsumo =
        selectedConsumo === "Todos" || loc.consumo === selectedConsumo;

      return matchEstrato && matchConsumo;
    });
  }, [locations, selectedEstrato, selectedConsumo]);

  // Métricas dinámicas para los chips de arriba
  const metrics = useMemo(() => {
    const total = locations.length;
    const visibles = filteredLocations.length;

    const porEstrato = [1, 2, 3, 4, 5, 6].reduce((acc, e) => {
      acc[e] = locations.filter((l) => l.estrato === e).length;
      return acc;
    }, {});

    const consumoAlto = locations.filter((l) => l.consumo === "Alto").length;

    return { total, visibles, porEstrato, consumoAlto };
  }, [locations, filteredLocations]);

  return (
    <div className="space-y-4">
      {/* Encabezado / contexto */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-sm font-semibold text-slate-900">
            Mapa de localizaciones
          </h1>
          <p className="text-[11px] text-slate-500 mt-1 max-w-xl">
            Vista geográfica de usuarios, activos y puntos de operación. Utiliza los filtros
            para analizar zonas por estrato y nivel de consumo.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] md:text-xs md:grid-cols-3">
          <MetricChip
            label="Total localizaciones"
            value={metrics.total}
          />
          <MetricChip
            label="Visibles con filtros"
            value={metrics.visibles}
          />
          <MetricChip
            label="Con consumo alto"
            value={metrics.consumoAlto}
          />
        </div>
      </div>

      {/* Filtros + Mapa */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm h-[520px] flex flex-col gap-3">
        {/* Filtros */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div className="flex flex-wrap gap-3">
            <FilterSelect
              label="Estrato"
              value={selectedEstrato}
              onChange={setSelectedEstrato}
              options={[
                "Todos",
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
              ]}
            />
            <FilterSelect
              label="Consumo"
              value={selectedConsumo}
              onChange={setSelectedConsumo}
              options={["Todos", "Alto", "Medio", "Bajo"]}
            />
          </div>

          <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
            <LegendDot color="bg-emerald-500" label="Consumo bajo" />
            <LegendDot color="bg-amber-500" label="Consumo medio" />
            <LegendDot color="bg-red-500" label="Consumo alto" />
          </div>
        </div>

        {/* Contenedor de mapa */}
        <div className="flex-1 rounded-xl overflow-hidden border border-slate-200">
          <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            className="w-full h-full"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredLocations.map((loc) => (
              <Marker
                key={loc.id}
                position={[loc.lat, loc.lng]}
                icon={getMarkerIcon(loc.consumo)}
              >
                <Popup>
                  <div className="text-[11px] space-y-1">
                    <p className="font-semibold text-slate-900">
                      {loc.nombre}
                    </p>
                    {loc.barrio && (
                      <p className="text-slate-600">
                        {loc.barrio}
                        {loc.ciudad ? ` · ${loc.ciudad}` : ""}
                      </p>
                    )}
                    <p className="text-slate-600">
                      Estrato: <span className="font-medium">{loc.estrato}</span>
                    </p>
                    <p className="text-slate-600">
                      Consumo:{" "}
                      <span className="font-medium">{loc.consumo}</span>
                    </p>
                    {loc.descripcion && (
                      <p className="text-slate-500 mt-1">
                        {loc.descripcion}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {locations.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-slate-900/70 px-4 py-2 text-[11px] text-slate-100 shadow-lg">
                Aún no hay localizaciones cargadas. Conecta el backend para
                visualizar los puntos en el mapa.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==== Componentes auxiliares ==== */

function MetricChip({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 mb-0.5">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt === "Todos" ? "Todos" : opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span>{label}</span>
    </span>
  );
}

/**
 * Icono de marcador según nivel de consumo.
 * Por ahora solo cambia el color del círculo, pero puedes
 * reemplazar esto por iconos SVG personalizados si quieres
 * algo más corporativo.
 */
function getMarkerIcon(consumo) {
  let color = "#22c55e"; // bajo
  if (consumo === "Medio") color = "#f97316";
  if (consumo === "Alto") color = "#ef4444";

  return L.divIcon({
    className: "",
    html: `
      <div style="
        background:${color};
        width:14px;
        height:14px;
        border-radius:999px;
        box-shadow:0 0 0 3px rgba(15,23,42,0.35);
      "></div>
    `,
    iconSize: [14, 14],
  });
}
