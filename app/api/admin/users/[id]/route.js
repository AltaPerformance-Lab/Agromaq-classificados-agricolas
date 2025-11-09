import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';

// Schema para validar os dados que chegam do formulário de edição
const editUserSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  email: z.string().email('Email inválido.'),
  role: z.enum(['USER', 'ADMIN']),
});

export async function PATCH(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
        return NextResponse.json({ error: 'ID de utilizador inválido.' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const validatedData = editUserSchema.parse(body);

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: validatedData.name,
                email: validatedData.email,
                role: validatedData.role,
            },
        });

        // Regista a ação do administrador no log de atividades
        await prisma.activityLog.create({
            data: {
                actorId: parseInt(session.user.id),
                actorName: session.user.name || 'Admin',
                action: 'EDIT_USER',
                targetType: 'User',
                targetId: userId.toString(),
                details: { message: `Perfil de ${updatedUser.name} atualizado.` },
            },
        });

        // Remove a senha do objeto antes de o enviar na resposta
        delete updatedUser.password;
        return NextResponse.json(updatedUser);

    } catch (error) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Dados inválidos.', details: error.issues }, { status: 400 });
        }
        console.error("Erro ao editar utilizador:", error);
        return NextResponse.json({ error: 'Ocorreu um erro inesperado.' }, { status: 500 });
    }
}

