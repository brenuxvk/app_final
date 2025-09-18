import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sqlQuery = "SELECT * FROM `poluicao` ORDER BY `id` DESC LIMIT 24";
    const historicalData: any = await query({ query: sqlQuery });
    
    return NextResponse.json(historicalData.reverse());
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor ao buscar o histórico.' }, { status: 500 });
  }
}