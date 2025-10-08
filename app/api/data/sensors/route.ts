import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Query SQL para buscar todos os sensores da nova tabela 'sensors'
    const sqlQuery = "SELECT * FROM `sensors`";
    
    const sensorsFromDB: any = await query({ query: sqlQuery });

    if (!sensorsFromDB || sensorsFromDB.length === 0) {
      return NextResponse.json([]); // Retorna um array vazio se não houver sensores
    }
    
    // Simula os dados de AQI e CO2 para cada sensor, já que essa informação
    // vem da tabela 'poluicao' e não da 'sensors'.
    const sensorsWithLiveData = sensorsFromDB.map((sensor: any) => ({
      ...sensor,
      aqi: sensor.status === 'online' ? Math.round(65 + Math.random() * 30) : 0,
      co2: sensor.status === 'online' ? Math.round(420 + Math.random() * 50) : 0,
      lastUpdate: new Date(sensor.last_update).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })
    }));

    return NextResponse.json(sensorsWithLiveData);

  } catch (error) {
    console.error("Erro na API /sensors:", error);
    return NextResponse.json({ error: 'Erro ao buscar dados dos sensores.' }, { status: 500 });
  }
}