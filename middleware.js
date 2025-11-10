// middleware.js (VERSÃO CORRIGIDA E POLIDA)
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // --- CORREÇÃO 1: Adicionamos as rotas de conteúdo ---
    // Estas são as rotas que um visitante (não logado) pode ver.
    const publicRoutes = [
        '/', // Página Inicial
        '/login',
        '/register',
        '/blog', // Permite /blog e /blog/[slug]
        '/anuncio', // Permite /anuncio/maquina/[slug] e /anuncio/fazenda/[slug]
        '/fazendas', // Permite a página de listagem /fazendas (se existir)
    ];

    // --- CORREÇÃO 2: Mudamos de "igual" (===) para "começa com" (startsWith) ---
    // Isso permite que /anuncio/maquina/slug-teste seja pego por '/anuncio'
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // Obtém o token de sessão do utilizador
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    // CASO 1: O utilizador NÃO está logado e tenta aceder a uma rota protegida
    if (!isPublicRoute && !token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // CASO 2: O utilizador ESTÁ logado e tenta aceder às páginas de login/registo
    if (token && (pathname === '/login' || pathname === '/register')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Se nenhum dos casos acima for verdadeiro, permite o acesso
    return NextResponse.next();
}

// O seu 'config.matcher' já está perfeito.
// Ele executa o middleware em TUDO, exceto API, arquivos estáticos e imagens.
export const config = {
    matcher: [
      '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};