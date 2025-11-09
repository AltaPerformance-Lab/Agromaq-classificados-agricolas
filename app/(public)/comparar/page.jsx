import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CompararClient from './CompararClient'; // O nosso novo componente de cliente

// SEO: Gera metadados dinâmicos para a página
export async function generateMetadata({ searchParams }) {
    const slugs = searchParams.slugs ? searchParams.slugs.split(',') : [];
    const count = slugs.length;

    return {
        title: `Comparar ${count > 0 ? count : ''} Máquinas | AgroMaq`,
        description: `Compare lado a lado as especificações e preços de ${count} máquinas agrícolas. Encontre a melhor opção para você na AgroMaq.`,
    };
}

// Função para buscar os dados das máquinas no servidor
async function getMaquinasParaComparar(slugs) {
    if (!slugs || slugs.length === 0) {
        return [];
    }

    const maquinas = await prisma.anuncioMaquina.findMany({
        where: {
            slug: {
                in: slugs,
            },
            status: 'ATIVO',
            deletedAt: null,
        },
        include: {
            user: { // Incluímos o usuário para obter o contato
                select: {
                    phone: true,
                },
            },
            imagens: {
                where: { isPrincipal: true },
                take: 1,
            }
        },
    });

    // Reordena os resultados para manter a mesma ordem da seleção do usuário
    return slugs.map(slug => maquinas.find(m => m.slug === slug)).filter(Boolean);
}

// A página principal (Server Component)
export default async function CompararPage({ searchParams }) {
    const slugs = searchParams.slugs ? searchParams.slugs.split(',') : [];
    const maquinas = await getMaquinasParaComparar(slugs);

    if (slugs.length > 0 && maquinas.length === 0) {
        notFound();
    }

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6">Comparativo de Máquinas</h1>
            
            {maquinas.length > 0 ? (
                <CompararClient maquinas={maquinas} />
            ) : (
                <div className="text-center bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Selecione máquinas para comparar</h2>
                    <p className="text-gray-500 mb-6">Volte para a página inicial, marque a caixa de seleção nos anúncios que deseja e clique no botão "Comparar".</p>
                    <Link href="/" className="inline-block bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-yellow-600 transition duration-300">
                        Voltar para a Página Inicial
                    </Link>
                </div>
            )}
        </main>
    );
}

