import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { nome, filtros, categoria } = body;

    // Validação
    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
      return NextResponse.json({ error: 'O nome do alerta é obrigatório.' }, { status: 400 });
    }

    if (!filtros || typeof filtros !== 'object' || Object.keys(filtros).length === 0) {
        return NextResponse.json({ error: 'Não é possível salvar uma busca vazia.' }, { status: 400 });
    }

    const novoAlerta = await prisma.alertaBusca.create({
      data: {
        userId: parseInt(session.user.id, 10),
        nome: nome.trim(),
        // Adicionamos a categoria aos filtros para saber o que procurar no futuro
        filtros: { ...filtros, category: categoria }, 
      },
    });

    return NextResponse.json(novoAlerta, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar alerta de busca:", error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}
