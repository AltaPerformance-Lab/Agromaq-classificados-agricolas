import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Defina aqui as rotas que são públicas e não precisam de login
    const publicRoutes = [
        '/', // Página Inicial
        '/login',
        '/register',
        '/api/users', // API para criar utilizadores
    ];

    // Verifica se a rota atual é uma das rotas públicas
    const isPublicRoute = publicRoutes.some(route => pathname === route);

    // Obtém o token de sessão do utilizador
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    // CASO 1: O utilizador NÃO está logado e tenta aceder a uma rota protegida
    if (!isPublicRoute && !token) {
        const loginUrl = new URL('/login', request.url);
        // Adiciona a página que ele tentou aceder como callbackUrl
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // CASO 2: O utilizador ESTÁ logado e tenta aceder às páginas de login/registo
    if (token && (pathname === '/login' || pathname === '/register')) {
        // Redireciona-o para o painel, pois ele já está autenticado
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Se nenhum dos casos acima for verdadeiro, permite o acesso
    return NextResponse.next();
}

// --- CORREÇÃO ---
// A configuração do 'matcher' foi atualizada para excluir explicitamente 
// todas as rotas que começam com '/api/'.
export const config = {
    matcher: [
        /*
         * Corresponde a todos os caminhos, exceto os que são para:
         * - Rotas da API (começam com /api/)
         * - Ficheiros estáticos do Next.js (começam com /_next/static/)
         * - Ficheiros de otimização de imagem do Next.js (começam com /_next/image/)
         * - O favicon.ico
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
