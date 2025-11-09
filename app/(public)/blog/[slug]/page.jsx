import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import PostPageClient from './PostPageClient'; // Importamos o novo Client Component

// Busca um único artigo pelo slug e incrementa a visualização
async function getPost(slug) {
    const post = await prisma.post.findUnique({
        where: { slug, status: 'PUBLISHED' },
        include: {
            author: { select: { name: true } },
        },
    });

    if (!post) notFound();
    
    // Atualiza a contagem de visualizações (não bloqueia a renderização)
    await prisma.post.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
    });

    return post;
}

// Busca as cotações de commodities
async function getCommodityPrices() {
    return prisma.commodityPrice.findMany({
        orderBy: { name: 'asc' }
    });
}

// Busca as interações do utilizador logado para este post
async function getUserInteractions(postId, userId) {
    if (!userId) {
        return { isFavorite: false, isReadLater: false };
    }
    const interaction = await prisma.userPostInteraction.findUnique({
        where: {
            userId_postId: {
                userId: userId,
                postId: postId,
            },
        },
    });
    return {
        isFavorite: interaction?.isFavorite || false,
        isReadLater: interaction?.isReadLater || false,
    };
}

// SEO: Gera metadados dinâmicos para cada artigo
export async function generateMetadata({ params }) {
    // Usamos uma busca mais simples aqui para não incrementar a view count duas vezes
    const post = await prisma.post.findUnique({ where: { slug: params.slug } });
    if (!post) return { title: 'Artigo não encontrado' };
    
    return {
        title: `${post.title} | Blog AgroMaq`,
        description: post.excerpt,
        openGraph: {
            title: `${post.title} | Blog AgroMaq`,
            description: post.excerpt,
            images: [{ url: `${process.env.NEXT_PUBLIC_BASE_URL}${post.imageUrl}` }],
        },
    };
}

// O Server Component que busca todos os dados
export default async function PostPage({ params }) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;
    
    const post = await getPost(params.slug);
    const commodityPrices = await getCommodityPrices();
    const initialInteractions = await getUserInteractions(post.id, userId);

    return (
        <PostPageClient
            post={post}
            commodityPrices={commodityPrices}
            initialInteractions={initialInteractions}
        />
    );
}

