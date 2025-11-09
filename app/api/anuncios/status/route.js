import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createLog } from '@/lib/logService';

export async function PATCH(request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
    }

    try {
        const { type, id, status } = await request.json();

        const model = type === 'maquina' ? prisma.anuncioMaquina : prisma.anuncioFazenda;
        const targetModelName = type === 'maquina' ? 'AnuncioMaquina' : 'AnuncioFazenda';
        const userId = parseInt(session.user.id, 10);

        // 1. Segurança: Verifica se o anúncio existe e pertence ao utilizador logado
        const anuncio = await model.findFirst({
            where: {
                id: parseInt(id, 10),
                userId: userId,
            },
        });

        if (!anuncio) {
            return NextResponse.json({ error: 'Anúncio não encontrado ou acesso negado.' }, { status: 404 });
        }

        // 2. Atualiza o status do anúncio
        const updatedAnuncio = await model.update({
            where: { id: anuncio.id },
            data: { status },
        });

        // 3. Regista a ação no novo sistema de logs
        await createLog({
            actorId: userId,
            actorName: session.user.name,
            action: status === 'PAUSADO' ? 'PAUSE_AD' : 'REACTIVATE_AD_USER',
            targetType: targetModelName,
            targetId: anuncio.id,
        });
        
        // TODO: Enviar notificação por e-mail para o utilizador

        return NextResponse.json(updatedAnuncio);

    } catch (error) {
        console.error("Erro ao alterar status do anúncio pelo utilizador:", error);
        return NextResponse.json({ error: 'Ocorreu um erro no servidor.' }, { status: 500 });
    }
}
