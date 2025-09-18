import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getMockSensorStatus() {
  const locations = ["Pedreira Norte", "Usina Siderúrgica", "Fábrica de Cimento", "Mineradora Sul", "Indústria Química"];
  return locations.map((location, index) => ({
    id: `S00${index + 1}`,
    location,
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