import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sqlQuery = "SELECT * FROM `poluicao` ORDER BY `id` DESC LIMIT 1";
    const data: any = await query({ query: sqlQuery });

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Nenhum dado encontrado' }, { status: 404 });
    }
    
    const latestData = data[0];
    const alerts = [];
    const alertThreshold = 1000;
    const currentValue = parseFloat(latestData.value);

    if (!isNaN(currentValue) && currentValue > alertThreshold) {
      alerts.push({
        id: `alert-${latestData.id}`,
        level: "Alto",
        title: `${latestData.sensor} - Nível Elevado Detectado`,
        message: `Sensor registrou valor de ${currentValue.toFixed(0)} ppm, excedendo o limite de ${alertThreshold} ppm.`
      });
    }

    return NextResponse.json({ latestData, alerts });
  } catch (error) {
    return NextResponse.json({ error: 'Erro no servidor da API /latest.' }, { status: 500 });
  }
}