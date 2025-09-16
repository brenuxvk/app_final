// app/api/data/historical/route.ts
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const historicalData = await prisma.sensor_data.findMany({
      take: 24, // Pega os últimos 24 registros
      orderBy: {
        timestamp: 'desc',
      },
    })
    
    // Inverte a ordem para que o gráfico mostre do mais antigo para o mais novo
    return NextResponse.json(historicalData.reverse())
  } catch (error) {
    console.error("Erro ao buscar dados históricos:", error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}