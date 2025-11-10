import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Por favor, insira o seu email e senha.');
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.password) {
                    throw new Error('Utilizador não encontrado ou senha não configurada.');
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error('A senha está incorreta.');
                }

                // Se a autenticação for bem-sucedida, retorna os dados do utilizador
                // que serão passados para o callback 'jwt'.
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                };
            }
        })
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        // Este callback é executado sempre que um token JWT é criado ou atualizado.
        // O objeto 'user' aqui é o que retornámos da função 'authorize'.
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.phone = user.phone;
            }
            return token;
        },
        // Este callback é executado sempre que uma sessão é acedida.
        // O objeto 'token' aqui é o que retornámos do callback 'jwt'.
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.phone = token.phone;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

