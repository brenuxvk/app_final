import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Query para buscar a média dos valores do dia anterior
    // CURDATE() pega a data atual
    const yesterdayAvgQuery = `
      SELECT AVG(CAST(value AS DECIMAL(10, 2))) as average_value
      FROM poluicao
      WHERE dia >= CURDATE() - INTERVAL 1 DAY AND dia < CURDATE()
    `;
    const yesterdayData: any = await query({ query: yesterdayAvgQuery });
    const yesterdayAverage = yesterdayData[0]?.average_value;

    // Query para buscar o valor mais recente
    const latestValueQuery = "SELECT value FROM `poluicao` ORDER BY `id` DESC LIMIT 1";
    const latestData: any = await query({ query: latestValueQuery });
    const latestValue = parseFloat(latestData[0]?.value);

    if (yesterdayAverage === null || isNaN(latestValue)) {
      // Se não houver dados de ontem ou o dado atual for inválido
      return NextResponse.json({ percentageChange: 0, trend: 'stable' });
    }

    // Calcula a mudança percentual
    const percentageChange = ((latestValue - yesterdayAverage) / yesterdayAverage) * 100;
    
    let trend = 'stable';
    if (percentageChange > 2) trend = 'increasing';
    if (percentageChange < -2) trend = 'decreasing';

    return NextResponse.json({
      percentageChange: Math.round(percentageChange),
      trend: trend,
    });

  } catch (error) {
    console.error("Erro na API /trend:", error);
    return NextResponse.json({ error: 'Erro interno do servidor ao calcular tendência.' }, { status: 500 });
  }
}