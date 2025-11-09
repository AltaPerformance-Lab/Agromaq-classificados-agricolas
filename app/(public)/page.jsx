import prisma from '@/lib/prisma';
import HomePageClient from '../HomePageClient';
import { formatCurrency, formatNumber } from '@/lib/formatters';

// SEO: Gera metadados dinâmicos para a página de Máquinas
export async function generateMetadata({ searchParams }) {
    const { tipo, marca, estado, cidade } = searchParams;
    let title = 'Comprar Máquinas Agrícolas e Veículos | AgroMaq';
    let description = 'Encontre os melhores anúncios de máquinas, tratores e veículos à venda. Filtre por preço, ano e localização.';

    if (tipo || marca || estado || cidade) {
        const details = [tipo, marca, cidade, estado].filter(Boolean).join(', ');
        title = `Venda de ${details} | AgroMaq`;
        description = `Confira as melhores ofertas para ${details}. Encontre o que você precisa na AgroMaq.`;
    }
    return { title, description };
}

// Lógica de busca, agora focada apenas em máquinas
async function getAnuncios(searchParams) {
    const { page = '1', ...filters } = searchParams;
    const currentPage = parseInt(page, 10) || 1;
    const take = 12;
    const skip = (currentPage - 1) * take;

    const where = { status: 'ATIVO', deletedAt: null };
    if (filters.search) where.nome = { contains: filters.search, mode: 'insensitive' };
    if (filters.tipo) where.tipo = filters.tipo;
    if (filters.marca) where.marca = filters.marca;
    if (filters.estado) where.estado = filters.estado;
    if (filters.cidade) where.cidade = filters.cidade;
    if (filters.ano_min) where.ano = { ...where.ano, gte: parseInt(filters.ano_min) };
    if (filters.ano_max) where.ano = { ...where.ano, lte: parseInt(filters.ano_max) };
    if (filters.preco_min) where.preco = { ...where.preco, gte: BigInt(filters.preco_min) };
    if (filters.preco_max) where.preco = { ...where.preco, lte: BigInt(filters.preco_max) };
    if (filters.horas_min) where.horas = { ...where.horas, gte: parseInt(filters.horas_min) };
    if (filters.horas_max) where.horas = { ...where.horas, lte: parseInt(filters.horas_max) };
    
    const anuncios = await prisma.anuncioMaquina.findMany({ where, take, skip, orderBy: { updatedAt: 'desc' }, include: { imagens: { where: { isPrincipal: true }, take: 1 } } });
    const totalAnuncios = await prisma.anuncioMaquina.count({ where });
    const totalPages = Math.ceil(totalAnuncios / take);

    return { anuncios, totalPages, totalAnuncios };
}

async function getFeaturedAnuncios() {
    return prisma.anuncioMaquina.findMany({ where: { status: 'ATIVO', deletedAt: null }, take: 4, orderBy: { createdAt: 'desc' }, include: { imagens: { where: { isPrincipal: true }, take: 1 } } });
}

export default async function HomePage({ searchParams }) {
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
                featuredTitle="Máquinas em Destaque"
                listTitle={listTitle}
                category="maquinas"
                hasFilters={hasFilters}
            />
        </main>
    );
}

