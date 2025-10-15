"use client"

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { icon } from 'leaflet'

const ICON = icon({
  iconUrl: "/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface Sensor {
  id: string;
  location: string;
  position: [number, number];
  aqi: number;
}

interface MapDisplayProps {
  sensors: Sensor[];
}

export default function MapDisplay({ sensors }: MapDisplayProps) {
  return (
    <MapContainer center={[-23.5505, -46.80]} zoom={12} style={{ height: '100%', width: '100%' }} className="rounded-lg">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {sensors.map(sensor => (
        <Marker key={sensor.id} position={sensor.position} icon={ICON}>
          <Popup>
            <strong>{sensor.location}</strong><br />AQI: {sensor.aqi}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}