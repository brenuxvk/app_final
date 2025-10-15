import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

const CRITICAL_POLLUTION_THRESHOLD = 200; // Defina o limite crítico de poluição

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sqlQuery = "SELECT * FROM `poluicao` ORDER BY `id` DESC LIMIT 1";
    const latestDataResult: any = await query({ query: sqlQuery });

    if (!latestDataResult || latestDataResult.length === 0) {
      return NextResponse.json({ error: 'Nenhum dado encontrado' }, { status: 404 });
    }

    const latestData = latestDataResult[0];
    const latestValue = parseFloat(latestData?.value);
    const alerts = [];

    // Logic to generate an alert (without saving to the database)
    if (!isNaN(latestValue) && latestValue > CRITICAL_POLLUTION_THRESHOLD) {
      alerts.push({
        id: `alert-${Date.now()}`,
        title: "Nível Crítico de Poluição",
        message: `Sensor principal registou um valor de ${latestValue.toFixed(2)} ppm, excedendo o limite de ${CRITICAL_POLLUTION_THRESHOLD} ppm.`,
        level: "Crítico",
      });
    }

    return NextResponse.json({ latestData, alerts });
  } catch (error) {
    console.error("Erro na API /api/latest:", error);
    return NextResponse.json({ error: 'Erro interno do servidor ao buscar o último dado.' }, { status: 500 });
  }
}