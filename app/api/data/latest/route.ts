import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Garante que a rota não seja cacheada

export async function GET() {
  try {
    const sqlQuery = "SELECT * FROM `poluicao` ORDER BY `id` DESC LIMIT 1";
    const latestData: any = await query({ query: sqlQuery });

    if (!latestData || latestData.length === 0) {
      return NextResponse.json({ error: 'Nenhum dado encontrado' }, { status: 404 });
    }

    return NextResponse.json(latestData[0]);
  } catch (error) {
    // O erro detalhado será impresso no terminal do VS Code
    return NextResponse.json({ error: 'Erro interno do servidor ao buscar o último dado.' }, { status: 500 });
  }
}