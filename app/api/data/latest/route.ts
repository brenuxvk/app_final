// app/api/data/latest/route.ts
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const latestData = await prisma.sensor_data.findFirst({
      orderBy: {
        timestamp: 'desc',
      },
    })

    if (!latestData) {
      return NextResponse.json({ error: 'Nenhum dado encontrado' }, { status: 404 })
    }

    return NextResponse.json(latestData)
  } catch (error) {
    console.error("Erro ao buscar dado mais recente:", error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}