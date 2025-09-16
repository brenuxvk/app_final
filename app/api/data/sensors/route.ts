// app/api/data/sensors/route.ts
import { NextResponse } from 'next/server'

// Simulação de dados de sensores, já que não temos essa tabela no banco
function getMockSensorStatus() {
  const locations = ["Pedreira Norte", "Usina Siderúrgica", "Fábrica de Cimento", "Mineradora Sul", "Indústria Química"]
  return locations.map((location, index) => {
    const isOnline = Math.random() > 0.1
    return {
      id: `S00${index + 1}`,
      location,
      status: isOnline ? "online" : "offline",
      aqi: isOnline ? Math.round(65 + Math.random() * 30) : 0,
      co2: isOnline ? Math.round(420 + Math.random() * 50) : 0,
      lastUpdate: isOnline ? `${Math.floor(Math.random() * 10) + 1} min` : "2h",
    }
  })
}

export async function GET() {
  try {
    const sensors = getMockSensorStatus()
    return NextResponse.json(sensors)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar dados dos sensores' }, { status: 500 })
  }
}