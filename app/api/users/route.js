// app/api/users/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { createUserSchema } from '@/lib/schemas/userSchema';

export async function POST(request) {
  try {
    const body = await request.json();

    // 1. Validar os dados recebidos com Zod
    const validation = createUserSchema.safeParse(body);

    if (!validation.success) {
      // Se a validação falhar, retornamos os erros.
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, password, phone } = validation.data;

    // 2. Verificar se o email ou telefone já existem
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { phone: phone }
        ]
      }
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'telefone';
      return NextResponse.json({ error: `Este ${field} já está em uso` }, { status: 409 });
    }

    // 3. Encriptar a senha com bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Verificar se este é o primeiro utilizador a ser criado
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? 'ADMIN' : 'USER';

    // 5. Criar o novo utilizador no banco de dados com a senha encriptada e o papel correto
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role,
      },
    });

    // 6. Retornar o utilizador criado com sucesso (sem a senha)
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar utilizador:", error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor' }, { status: 500 });
  }
}
