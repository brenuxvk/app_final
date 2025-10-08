import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Lê o parâmetro 'period' da URL. O padrão é '24h'.
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '24h';

    let sqlQuery;
    let groupByClause = '';
    let dateFormat = '';
    let orderByClause = 'ORDER BY id ASC'; // Padrão para manter a ordem cronológica

    switch (period) {
      case '7d':
        // Busca todos os registos dos últimos 7 dias
        sqlQuery = `
          SELECT * FROM poluicao
          WHERE dia >= CURDATE() - INTERVAL 7 DAY
          ${orderByClause}
        `;
        break;
      case '30d':
        // Busca a MÉDIA diária dos últimos 30 dias para não sobrecarregar o gráfico
        dateFormat = `DATE_FORMAT(dia, '%d/%m')`;
        groupByClause = `GROUP BY DATE(dia)`;
        orderByClause = `ORDER BY DATE(dia) ASC`;
        sqlQuery = `
          SELECT 
            ${dateFormat} as dia_formatado,
            AVG(CAST(value AS DECIMAL(10, 2))) as value,
            sensor,
            location
          FROM poluicao
          WHERE dia >= CURDATE() - INTERVAL 30 DAY
          ${groupByClause}
          ${orderByClause}
        `;
        break;
      default: // '24h'
        // Busca os últimos 24 registos (aproximadamente 24 horas)
        sqlQuery = `
          (SELECT * FROM poluicao ORDER BY id DESC LIMIT 24) AS subquery
          ${orderByClause}
        `;
        // Envolvemos a subquery para poder ordenar por ASC no final
        sqlQuery = `SELECT * FROM ${sqlQuery}`;
        break;
    }

    const historicalData: any = await query({ query: sqlQuery });

    // Se agregamos por dia, precisamos de renomear a coluna para 'dia' para consistência
    const formattedData = historicalData.map((d: any) => ({
      ...d,
      dia: d.dia_formatado || d.dia 
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Erro na API /historical:", error);
    return NextResponse.json({ error: 'Erro interno do servidor ao buscar o histórico.' }, { status: 500 });
  }
}