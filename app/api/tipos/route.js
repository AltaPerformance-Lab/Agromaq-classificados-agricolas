import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const tipos = await prisma.tipo.findMany({
      orderBy: { nome: 'asc' },
    });
    return NextResponse.json(tipos);
  } catch (error) {
    console.error("Erro ao buscar tipos:", error);
    return NextResponse.json({ error: 'Não foi possível obter os tipos de máquinas.' }, { status: 500 });
  }
}
