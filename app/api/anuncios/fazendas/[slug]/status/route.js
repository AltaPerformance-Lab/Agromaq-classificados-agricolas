import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../auth/[...nextauth]/route';

// Função para alterar o STATUS de um anúncio de fazenda
export async function PATCH(request, { params }) {
    const session = await getServerSession(authOptions);
    const { slug } = params;
    const { status } = await request.json();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (!['ATIVO', 'PAUSADO'].includes(status)) {
        return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    try {
        const anuncio = await prisma.anuncioFazenda.findUnique({ where: { slug } });
        
        if (!anuncio || anuncio.userId !== parseInt(session.user.id, 10)) {
            return NextResponse.json({ error: 'Anúncio não encontrado ou acesso negado' }, { status: 404 });
        }

        const updatedAnuncio = await prisma.anuncioFazenda.update({
            where: { slug },
            data: { status },
        });

        return NextResponse.json(updatedAnuncio, { status: 200 });
    } catch (error) {
        console.error("Erro ao alterar status de fazenda:", error);
        return NextResponse.json({ error: 'Ocorreu um erro inesperado' }, { status: 500 });
    }
}
