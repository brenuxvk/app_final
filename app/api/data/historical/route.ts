// app/api/data/historical/route.ts
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Usando os nomes corretos: 'poluicao' e 'id'
    const historicalData = await prisma.poluicao.findMany({
      take: 24,
      orderBy: {
        id: 'desc',
      },
    })
    
    return NextResponse.json(historicalData.reverse())
  } catch (error) {
    console.error("Erro ao buscar dados históricos:", error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}