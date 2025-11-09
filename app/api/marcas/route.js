import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const marcas = await prisma.marca.findMany({
      orderBy: { nome: 'asc' },
    });
    return NextResponse.json(marcas);
  } catch (error) {
    console.error("Erro ao buscar marcas:", error);
    return NextResponse.json({ error: 'Não foi possível obter as marcas.' }, { status: 500 });
  }
}
