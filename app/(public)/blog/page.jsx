import prisma from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import CommodityWidget from '@/app/components/CommodityWidget';
import BlogSearch from './BlogSearch'; // Importamos o novo componente de busca

// SEO
export const metadata = {
    title: 'Blog AgroMaq | Notícias e Dicas sobre o Agronegócio',
    description: 'Fique por dentro das últimas notícias, dicas de mercado, e tecnologias para o agronegócio no Blog da AgroMaq.',
};

// Busca os artigos, agora com a opção de filtrar por um termo de busca
async function getPosts(query) {
    const where = {
        status: 'PUBLISHED',
    };

    if (query) {
        where.OR = [
            { title: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
        ];
    }

    return prisma.post.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        include: {
            author: { select: { name: true } },
        },
    });
}

// Busca as cotações
async function getCommodityPrices() {
    return prisma.commodityPrice.findMany({
        orderBy: { name: 'asc' }
    });
}

export default async function BlogPage({ searchParams }) {
    const query = searchParams.q || '';
    const posts = await getPosts(query);
    const commodityPrices = await getCommodityPrices();

    return (
        <div className="bg-gray-100">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-900">Blog AgroMaq</h1>
                    <p className="mt-2 text-lg text-gray-600">Notícias, dicas e insights sobre o mundo do agronegócio.</p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* A barra de busca agora faz parte da página */}
                <BlogSearch initialQuery={query} />
                
                <CommodityWidget prices={commodityPrices} />

                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-xl font-semibold text-gray-800">Nenhum artigo encontrado</h3>
                        <p className="text-gray-500 mt-2">Tente uma busca diferente ou volte em breve para novos conteúdos.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

// --- Componente do Card do Artigo (sem alterações) ---
const PostCard = ({ post }) => (
    <Link href={`/blog/${post.slug}`} className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
        <div className="relative w-full h-56">
            <Image
                src={post.imageUrl || '/placeholder.jpg'}
                alt={`Imagem de capa do artigo: ${post.title}`}
                fill
                style={{objectFit: 'cover'}}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
        </div>
        <div className="p-6 flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors flex-grow min-h-[56px]">{post.title}</h2>
            <p className="mt-2 text-gray-600 line-clamp-3 flex-grow">{post.excerpt}</p>
            <div className="mt-4 text-sm text-gray-500 pt-4 border-t">
                <span>Por {post.author.name}</span>
                <span className="mx-2">•</span>
                <span>{new Date(post.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>
        </div>
    </Link>
);

