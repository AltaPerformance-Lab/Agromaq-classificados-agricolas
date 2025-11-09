import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const { id: anuncioId, imageId } = params;
    if (isNaN(parseInt(imageId, 10)) || isNaN(parseInt(anuncioId, 10))) {
        return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
    }

    try {
        const { type, reason } = await request.json();
        if (!type || !reason) {
            return NextResponse.json({ error: 'O tipo do anúncio e o motivo são obrigatórios.' }, { status: 400 });
        }

        const imageModel = type === 'maquina' ? prisma.anuncioImagem : prisma.anuncioImagemFazenda;
        const targetType = type === 'maquina' ? 'AnuncioMaquina' : 'AnuncioFazenda';

        // 1. Encontrar a imagem para obter os caminhos dos ficheiros
        const imageToDelete = await imageModel.findUnique({
            where: { id: parseInt(imageId, 10) },
        });

        if (!imageToDelete) {
            return NextResponse.json({ error: 'Imagem não encontrada.' }, { status: 404 });
        }

        // 2. Apagar os ficheiros físicos do servidor
        try {
            const fullPath = path.join(process.cwd(), 'public', imageToDelete.url);
            const thumbPath = path.join(process.cwd(), 'public', imageToDelete.thumbnailUrl);
            await unlink(fullPath);
            await unlink(thumbPath);
        } catch (fsError) {
            console.warn(`[AVISO] Falha ao apagar ficheiro de imagem do disco (pode já ter sido removido): ${fsError.message}`);
        }

        // 3. Apagar o registo da imagem da base de dados e criar o log numa transação
        const [deletedImage] = await prisma.$transaction([
             imageModel.delete({
                where: { id: parseInt(imageId, 10) },
            }),
             prisma.activityLog.create({
                data: {
                    actorId: parseInt(session.user.id, 10),
                    actorName: session.user.name || 'Admin',
                    action: 'DELETE_AD_IMAGE', // <<< Lembre-se de adicionar este novo tipo ao seu enum ActivityType no schema.prisma
                    targetType: targetType,
                    targetId: anuncioId,
                    details: {
                        message: `Admin apagou uma imagem do anúncio.`,
                        reason: reason,
                        deletedImageUrl: imageToDelete.url,
                    },
                },
            }),
        ]);

        return NextResponse.json({ message: 'Imagem apagada com sucesso.' });

    } catch (error) {
        console.error("Erro ao apagar imagem:", error);
        return NextResponse.json({ error: 'Ocorreu um erro inesperado.' }, { status: 500 });
    }
}

