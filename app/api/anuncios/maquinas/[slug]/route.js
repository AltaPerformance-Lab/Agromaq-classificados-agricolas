import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

// Função para o SOFT DELETE de um anúncio de máquina
export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    const { slug } = params;

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const anuncio = await prisma.anuncioMaquina.findUnique({ where: { slug } });
        
        // Verifica se o anúncio existe e se pertence ao utilizador logado
        if (!anuncio || anuncio.userId !== parseInt(session.user.id, 10)) {
            return NextResponse.json({ error: 'Anúncio não encontrado ou acesso negado' }, { status: 404 });
        }

        // Realiza o soft delete
        await prisma.anuncioMaquina.update({
            where: { slug },
            data: { deletedAt: new Date() },
        });

        return NextResponse.json({ message: 'Anúncio apagado com sucesso' }, { status: 200 });
    } catch (error) {
        console.error("Erro ao apagar anúncio:", error);
        return NextResponse.json({ error: 'Ocorreu um erro inesperado' }, { status: 500 });
    }
}
