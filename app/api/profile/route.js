import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { z } from 'zod';

// Schema para atualizar o perfil (sem a senha)
const updateUserSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  email: z.string().email('Email inválido.'),
  phone: z.string().transform(val => val.replace(/\D/g, '')).pipe(z.string().length(11, 'O telefone deve ter 11 dígitos.')),
});

export async function PUT(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Validar os dados recebidos
    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, phone } = validation.data;

    // Verificar se o novo email ou telefone já está em uso por outro utilizador
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ email }, { phone }],
            id: { not: session.user.id } // Excluir o próprio utilizador da verificação
        }
    });

    if (existingUser) {
        const field = existingUser.email === email ? 'email' : 'telefone';
        return NextResponse.json({ error: `Este ${field} já está em uso.` }, { status: 409 });
    }

    // Atualizar o utilizador na base de dados
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
        phone,
      },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword, { status: 200 });

  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado.' }, { status: 500 });
  }
}
