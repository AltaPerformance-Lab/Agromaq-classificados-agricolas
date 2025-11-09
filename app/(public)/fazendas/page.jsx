import prisma from '@/lib/prisma';
import HomePageClient from '@/HomePageClient'; // Ajuste no caminho de importação
import { formatCurrency, formatNumber } from '@/lib/formatters';

// SEO: Gera metadados dinâmicos para a página de Fazendas
export async function generateMetadata({ searchParams }) {
    const { estado, cidade } = searchParams;
    let title = 'Comprar Fazendas e Imóveis Rurais | AgroMaq';
    let description = 'Encontre os melhores anúncios de fazendas e imóveis rurais à venda. Filtre por preço, área e localização.';

    if (estado || cidade) {
        const details = [cidade, estado].filter(Boolean).join(', ');
        title = `Fazendas à venda em ${details} | AgroMaq`;
        description = `Confira as melhores ofertas de fazendas em ${details}. Encontre o que você precisa na AgroMaq.`;
    }
    return { title, description };
}

// Lógica de busca, agora focada apenas em fazendas
async function getAnuncios(searchParams) {
    const { page = '1', ...filters } = searchParams;
    const currentPage = parseInt(page, 10) || 1;
    const take = 12;
    const skip = (currentPage - 1) * take;

    const where = { status: 'ATIVO', deletedAt: null };
    if (filters.search) {
        where.OR = [
           { titulo: { contains: filters.search, mode: 'insensitive' } },
           { cidade: { contains: filters.search, mode: 'insensitive' } },
           { estado: { contains: filters.search, mode: 'insensitive' } },
       ];
    }
    if (filters.estado) where.estado = filters.estado;
    if (filters.cidade) where.cidade = filters.cidade;
    if (filters.preco_min) where.preco = { ...where.preco, gte: BigInt(filters.preco_min) };
    if (filters.preco_max) where.preco = { ...where.preco, lte: BigInt(filters.preco_max) };
    if (filters.area_min) where.area_total_hectares = { ...where.area_total_hectares, gte: parseFloat(String(filters.area_min).replace(',','.')) };
    if (filters.area_max) where.area_total_hectares = { ...where.area_total_hectares, lte: parseFloat(String(filters.area_max).replace(',','.')) };
    
    const anuncios = await prisma.anuncioFazenda.findMany({ where, take, skip, orderBy: { updatedAt: 'desc' }, include: { imagens: { where: { isPrincipal: true }, take: 1 } } });
    const totalAnuncios = await prisma.anuncioFazenda.count({ where });
    const totalPages = Math.ceil(totalAnuncios / take);

    return { anuncios, totalPages, totalAnuncios };
}

async function getFeaturedAnuncios() {
    return prisma.anuncioFazenda.findMany({ where: { status: 'ATIVO', deletedAt: null }, take: 4, orderBy: { createdAt: 'desc' }, include: { imagens: { where: { isPrincipal: true }, take: 1 } } });
}

export default async function FazendasPage({ searchParams }) {
    const { page, ...filters } = searchParams;
    const hasFilters = Object.keys(filters).length > 0 && Object.values(filters).some(v => v !== '');

    const { anuncios, totalPages, totalAnuncios } = await getAnuncios(searchParams);
    const featuredAnuncios = hasFilters ? [] : await getFeaturedAnuncios();
    
    const listTitle = hasFilters ? `Resultados da Busca (${totalAnuncios})` : 'Últimos Anúncios';
    
    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <HomePageClient 
                initialAnuncios={anuncios} 
                totalPages={totalPages}
                featuredAnuncios={featuredAnuncios}
                featuredTitle="Fazendas em Destaque"
                listTitle={listTitle}
                category="fazendas"
                hasFilters={hasFilters}
            />
        </main>
    );
}
