
import prisma from '@/lib/prisma';
import HomePageClient from '../HomePageClient';
import { formatCurrency, formatNumber } from '@/lib/formatters'; 

// SEO: Gera metadados dinâmicos (Seu código original - Perfeito!)
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

// --- POLIMENTO 3: Código Limpo (DRY) ---
// Extraímos o 'include' repetido para uma constante
const includePrincipalImage = {
  imagens: {
    where: { isPrincipal: true },
    take: 1
  }
};

// Lógica de busca de anúncios (Atualizada)
async function getAnuncios(searchParams) {
  const { page = '1', ...filters } = searchParams;
  const currentPage = parseInt(page, 10) || 1;
  const take = 12;
  const skip = (currentPage - 1) * take;

  const where = { status: 'ATIVO', deletedAt: null };

  // --- POLIMENTO 1: Busca "Inteligente" ---
  // Trocamos a busca simples 'nome' por uma busca 'OU' em múltiplos campos
  if (filters.search) {
    const q = filters.search;
    where.OR = [
      { nome: { contains: q, mode: 'insensitive' } },
      { tipo: { contains: q, mode: 'insensitive' } },
      { marca: { contains: q, mode: 'insensitive' } },
      { cidade: { contains: q, mode: 'insensitive' } },
      { estado: { contains: q, mode: 'insensitive' } },
    ];
  }
  
  // Filtros de refinamento (Seu código original - Perfeito!)
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
  
  // --- POLIMENTO 2: Performance (Busca e Contagem Paralelas) ---
  // Rodamos a busca de anúncios e a contagem total ao mesmo tempo
  const [anuncios, totalAnuncios] = await Promise.all([
    prisma.anuncioMaquina.findMany({
      where,
      take,
      skip,
      orderBy: { updatedAt: 'desc' },
      include: includePrincipalImage // <-- Usando a constante (Polimento 3)
    }),
    prisma.anuncioMaquina.count({ where })
  ]);

  const totalPages = Math.ceil(totalAnuncios / take);

  return { anuncios, totalPages, totalAnuncios };
}

// Lógica de busca de destaques (Atualizada)
async function getFeaturedAnuncios() {
  return prisma.anuncioMaquina.findMany({
    where: { status: 'ATIVO', deletedAt: null },
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: includePrincipalImage // <-- Usando a constante (Polimento 3)
  });
}

// Componente da Página (Atualizado)
export default async function HomePage({ searchParams }) {
  const { page, ...filters } = searchParams;
  const hasFilters = Object.keys(filters).length > 0 && Object.values(filters).some(v => v !== '');

  // --- POLIMENTO 2: Performance (Execução Paralela) ---
  // As duas chamadas de dados agora rodam ao mesmo tempo
  const [anunciosData, featuredAnuncios] = await Promise.all([
    getAnuncios(searchParams),
    hasFilters ? Promise.resolve([]) : getFeaturedAnuncios()
  ]);
  
  const { anuncios, totalPages, totalAnuncios } = anunciosData;
  
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