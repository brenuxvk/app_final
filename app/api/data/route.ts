// app/api/data/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

// Inicializa o cliente do Prisma
const prisma = new PrismaClient();

// Esta função será chamada quando seu front-end acessar /api/data
export async function GET() {
  try {
    // Busca o registro mais recente do seu banco de dados
    const latestData = await prisma.sua_tabela_de_sensores.findFirst({
      orderBy: {
        // IMPORTANTE: Mude 'timestamp_coluna' para o nome
        // da sua coluna de data/hora para ordenar pelo mais recente
        timestamp_coluna: 'desc',
      },
    });

    if (!latestData) {
      return NextResponse.json({ error: 'Nenhum dado encontrado no banco.' }, { status: 404 });
    }

    // Retorna o dado mais recente como uma resposta JSON
    return NextResponse.json(latestData);

  } catch (error) {
    console.error("Erro ao buscar dados do banco:", error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

/**
 * IMPORTANTE:
 * 1. Renomeie `sua_tabela_de_sensores` para o nome exato da sua tabela no banco de dados.
 * (O nome que foi gerado no seu arquivo `prisma/schema.prisma`).
 * 2. Renomeie `timestamp_coluna` para o nome da coluna que armazena a data e a hora
 * do registro (ex: `createdAt`, `timestamp`, `data_hora`, etc.).
 */