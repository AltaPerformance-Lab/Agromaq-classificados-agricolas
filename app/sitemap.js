import prisma from '@/lib/prisma';

// A função sitemap é chamada pelo Next.js durante a build para gerar o ficheiro sitemap.xml
export default async function sitemap() {
  // É crucial ter a URL base do seu site numa variável de ambiente
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // 1. Adiciona as rotas estáticas do seu site
  const staticRoutes = [
    '', // Página Inicial
    '/login',
    '/register',
    '/anunciar/maquina',
    '/anunciar/fazenda',
    '/comparar', // Página de comparação
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Busca todos os anúncios de máquinas ativos na base de dados
  const maquinas = await prisma.anuncioMaquina.findMany({
    where: {
      status: 'ATIVO',
      deletedAt: null,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  // Mapeia os anúncios de máquinas para o formato do sitemap
  const maquinaRoutes = maquinas.map((maquina) => ({
    url: `${baseUrl}/anuncio/maquina/${maquina.slug}`,
    lastModified: maquina.updatedAt.toISOString(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // 3. Busca todos os anúncios de fazendas ativos na base de dados
  const fazendas = await prisma.anuncioFazenda.findMany({
    where: {
      status: 'ATIVO',
      deletedAt: null,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  // Mapeia os anúncios de fazendas para o formato do sitemap
  const fazendaRoutes = fazendas.map((fazenda) => ({
    url: `${baseUrl}/anuncio/fazenda/${fazenda.slug}`,
    lastModified: fazenda.updatedAt.toISOString(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // 4. Combina todas as rotas e retorna o sitemap completo
  return [...staticRoutes, ...maquinaRoutes, ...fazendaRoutes];
}
