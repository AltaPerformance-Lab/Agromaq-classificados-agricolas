import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// Schema para validar a alteração de senha
const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'A senha atual é obrigatória.'),
  newPassword: z.string().min(8, 'A nova senha deve ter pelo menos 8 caracteres.'),
});

export async function PUT(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const validation = updatePasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { currentPassword, newPassword } = validation.data;

    // 1. Obter o utilizador atual da base de dados para verificar a senha
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
        return NextResponse.json({ error: 'Utilizador não encontrado.' }, { status: 404 });
    }

    // 2. Comparar a senha atual fornecida com a guardada na base de dados
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
        return NextResponse.json({ error: 'A senha atual está incorreta.' }, { status: 403 });
    }

    // 3. Encriptar a nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 4. Atualizar a senha na base de dados
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedNewPassword,
      },
    });

    return NextResponse.json({ message: 'Senha alterada com sucesso!' }, { status: 200 });

  } catch (error) {
    console.error("Erro ao alterar a senha:", error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado.' }, { status: 500 });
  }
}
