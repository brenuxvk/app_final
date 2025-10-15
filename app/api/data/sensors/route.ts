import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getMockSensorStatus() {
  const locations = [
    { name: "Pedreira Norte", position: [-23.53, -46.80] },
    { name: "Usina Siderúrgica", position: [-23.55, -46.82] },
    { name: "Fábrica de Cimento", position: [-23.54, -46.78] },
    { name: "Mineradora Sul", position: [-23.57, -46.81] },
    { name: "Indústria Química", position: [-23.56, -46.79] },
  ];
  return locations.map((loc, index) => ({
    id: `S00${index + 1}`,
    location: loc.name,
    position: loc.position, // Coordenadas para o mapa
    status: Math.random() > 0.1 ? "online" : "offline",
    aqi: Math.round(65 + Math.random() * 30),
    co2: Math.round(420 + Math.random() * 50),
    lastUpdate: `${Math.floor(Math.random() * 10) + 1} min`,
  }));
}

export async function GET() {
  try {
    const sensors = getMockSensorStatus();
    return NextResponse.json(sensors);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar dados dos sensores' }, { status: 500 });
  }
}