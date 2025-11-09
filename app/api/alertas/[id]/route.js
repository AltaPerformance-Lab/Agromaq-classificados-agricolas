import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

// Função para apagar um alerta de busca
export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    const { id } = params;

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const alerta = await prisma.alertaBusca.findUnique({ where: { id: parseInt(id, 10) } });
        
        if (!alerta || alerta.userId !== parseInt(session.user.id, 10)) {
            return NextResponse.json({ error: 'Alerta não encontrado ou acesso negado' }, { status: 404 });
        }

        await prisma.alertaBusca.delete({
            where: { id: parseInt(id, 10) },
        });

        return NextResponse.json({ message: 'Alerta apagado com sucesso' }, { status: 200 });
    } catch (error) {
        console.error("Erro ao apagar alerta:", error);
        return NextResponse.json({ error: 'Ocorreu um erro inesperado' }, { status: 500 });
    }
}
