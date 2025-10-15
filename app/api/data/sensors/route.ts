import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Buscamos o dado real mais recente do banco de dados.
    // Este dado será considerado o do nosso "sensor oficial" (S003).
    const latestDataQuery = "SELECT * FROM `poluicao` ORDER BY `id` DESC LIMIT 1";
    const latestDataResult: any = await query({ query: latestDataQuery });
    const officialSensorData = latestDataResult[0];

    // Coordenadas e nomes dos sensores
    const sensorDefinitions = [
      { id: 'S001', location: "Pedreira Norte", lat: -23.50, lon: -46.85 },
      { id: 'S002', location: "Usina Siderúrgica", lat: -23.52, lon: -46.87 },
      { id: 'S003', location: "Fábrica de Cimento", lat: -23.54, lon: -46.86 },
      { id: 'S004', location: "Mineradora Sul", lat: -23.55, lon: -46.88 },
      { id: 'S005', location: "Indústria Química", lat: -23.51, lon: -46.89 },
    ];

    const sensorsWithData = sensorDefinitions.map((sensorDef) => {
      if (sensorDef.id === 'S003' && officialSensorData) {
        // Se este é o sensor oficial, usamos os dados reais do banco.
        return {
          id: sensorDef.id,
          location: sensorDef.location,
          status: 'online', // Assumimos que o dado mais recente é de um sensor online
          aqi: Math.round(parseFloat(officialSensorData.value) / 10), // Exemplo de cálculo de AQI
          co2: Math.round(parseFloat(officialSensorData.value)),
          lastUpdate: new Date(officialSensorData.dia).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }),
          coords: [sensorDef.lat, sensorDef.lon]
        };
      } else {
        // Para os outros sensores, geramos dados simulados mais estáveis.
        const isOnline = Math.random() > 0.2; // 80% de chance de estar online
        const baseAQI = 75;
        const baseCO2 = 450;
        
        return {
          id: sensorDef.id,
          location: sensorDef.location,
          status: isOnline ? "online" : "offline",
          aqi: isOnline ? baseAQI + Math.floor(Math.random() * 20) - 10 : 0, // Variação de +/- 10
          co2: isOnline ? baseCO2 + Math.floor(Math.random() * 50) - 25 : 0, // Variação de +/- 25
          lastUpdate: isOnline ? `${Math.floor(Math.random() * 5) + 1} min` : "1h",
          coords: [sensorDef.lat, sensorDef.lon]
        };
      }
    });

    return NextResponse.json(sensorsWithData);

  } catch (error) {
    console.error("Erro na API /sensors:", error);
    return NextResponse.json({ error: 'Erro ao buscar dados dos sensores.' }, { status: 500 });
  }
}