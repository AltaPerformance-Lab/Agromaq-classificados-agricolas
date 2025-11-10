const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// --- NOVAS LISTAS DE IMAGENS "PREMIUM ++" (Seu Cloudinary) ---

// Helper para aplicar transformações do Cloudinary
const applyTransforms = (url, main = true) => {
  const transform = main ? 'c_fill,h_600,w_800' : 'c_fill,h_300,w_400';
  return url.replace('/upload/', `/upload/${transform}/`);
};

// --- MÁQUINAS ---
const plantadeiraImages = [
  { url: applyTransforms('https://res.cloudinary.com/ddbhf4qut/image/upload/v1762724669/db40acq_maxemerge_photo_field_large_28fbbcb841dc716da0e444c6ad5c7f76b4ed04bb_onuogj.avif'), thumbnailUrl: applyTransforms('https://res.cloudinary.com/ddbhf4qut/image/upload/v1762724669/db40acq_maxemerge_photo_field_large_28fbbcb841dc716da0e444c6ad5c7f76b4ed04bb_onuogj.avif', false), isPrincipal: true },
  { url: applyTransforms('https://res.cloudinary.com/ddbhf4qut/image/upload/v1762724228/webp_amifbm.jpg'), thumbnailUrl: applyTransforms('https://res.cloudinary.com/ddbhf4qut/image/upload/v1762724228/webp_amifbm.jpg', false), isPrincipal: false },
];

const tratorValtraImages = [
  { url: applyTransforms('https://res.cloudinary.com/ddbhf4qut/image/upload/v1762724574/WhatsApp-Image-2025-01-09-at-16.03.52_bdtdoh.jpg'), thumbnailUrl: applyTransforms('https://res.cloudinary.com/ddbhf4qut/image/upload/v1762724574/WhatsApp-Image-2025-01-09-at-16.03.52_bdtdoh.jpg', false), isPrincipal: true },
];

const pulverizadorStaraImages = [
  { url: applyTransforms('https://res.cloudinary.com/ddbhf4qut/image/upload/v1762724574/abertura_01_-imperador_stara-9_wvnluu.webp'), thumbnailUrl: applyTransforms('https://res.cloudinary.com/ddbhf4qut/image/upload/v1762724574/abertura_01_-imperador_stara-9_wvnluu.webp', false), isPrincipal: true },
  { url: applyTransforms('https://res.cloudinary.com/ddbhf4qut/image/upload/v1762724574/abertura_03_-imperador_stara-37_m3nkzy.webp'), thumbnailUrl: applyTransforms('https://res.cloudinary.com/ddbhf4qut/image/upload/v1762724574/abertura_03_-imperador_stara-37_m3nkzy.webp', false), isPrincipal: false },
  { url: applyTransforms('https://res.cloudinary.com/ddbhf4qut/image/upload/v1762724575/abertura_02_-imperador_stara-10_xrqpyr.webp'), thumbnailUrl: applyTransforms('https://res.cloudinary.com/ddbhf4qut/image/upload/v1762724575/abertura_02_-imperador_stara-10_xrqpyr.webp', false), isPrincipal: false },
];

// --- FAZENDAS ---
const fazendaImages1 = [
  { url: applyTransforms('https://res.cloudinary.com/ddbhf4qut/image/upload/v1762724575/cenario-de-produtos-naturais-fazenda-e-luz-solar_baaoop.jpg'), thumbnailUrl: applyTransforms('https://res.cloudinary.com/ddbhf4qut/image/upload/v1762724575/cenario-de-produtos-naturais-fazenda-e-luz-solar_baaoop.jpg', false), isPrincipal: true },
  { url: applyTransforms('https://res.cloudinary.com/ddbhf4qut/image/upload/v1762725053/fazendas-1024x620.jpg_lpmb7f.webp'), thumbnailUrl: applyTransforms('https://res.cloudinary.com/ddbhf4qut/image/upload/v1762725053/fazendas-1024x620.jpg_lpmb7f.webp', false), isPrincipal: false },
  { url: applyTransforms('https://res.cloudinary.com/ddbhf4qut/image/upload/v1762725053/meliponario_qen7m2.jpg'), thumbnailUrl: applyTransforms('https://res.cloudinary.com/ddbhf4qut/image/upload/v1762725053/meliponario_qen7m2.jpg', false), isPrincipal: false },
  { url: applyTransforms('https://res.cloudinary.com/ddbhf4qut/image/upload/v1762725053/casarao-historico_stkz80.jpg'), thumbnailUrl: applyTransforms('https://res.cloudinary.com/ddbhf4qut/image/upload/v1762725053/casarao-historico_stkz80.jpg', false), isPrincipal: false },
];
// (Vamos usar o mesmo set de imagens para as outras fazendas, só para popular)

// --- FUNÇÕES AUXILIARES (Sem mudanças) ---

const htmlToEditorJs = (html) => {
  // ... (Sua função original)
  const blocks = html.trim().split('\n').map(line => {
    if (line.startsWith('<h2>')) {
      return { type: 'header', data: { text: line.replace(/<\/?h2>/g, ''), level: 2 } };
    }
    if (line.startsWith('<ul>')) {
      const items = line.match(/<li>(.*?)<\/li>/g).map(item => item.replace(/<\/?li>/g, ''));
      return { type: 'list', data: { style: 'unordered', items } };
    }
    if (line.startsWith('<p>')) {
      return { type: 'paragraph', data: { text: line.replace(/<\/?p>/g, '') } };
    }
    return { type: 'paragraph', data: { text: line } };
  });

  return {
    time: Date.now(),
    blocks: blocks.map(block => ({ id: Math.random().toString(36).substr(2, 9), ...block })),
    version: "2.22.2"
  };
};

async function getInitialDolarPrice() {
  // ... (Sua função original)
  try {
    const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
    if (!response.ok) return 5.45;
    const data = await response.json();
    return parseFloat(data.USDBRL.bid);
  } catch (error) {
    console.warn("Não foi possível buscar a cotação inicial do Dólar. Usando valor padrão.");
    return 5.45;
  }
}

// --- FUNÇÕES DE SEED MODULARES (Atualizadas) ---

async function clearDatabase() {
  console.log('A limpar a base de dados...');
  await prisma.activityLog.deleteMany({});
  await prisma.userPostInteraction.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.alertaBusca.deleteMany({});
  await prisma.anuncioImagem.deleteMany({});
  await prisma.anuncioImagemFazenda.deleteMany({});
  await prisma.anuncioMaquina.deleteMany({});
  await prisma.anuncioFazenda.deleteMany({});
  await prisma.commodityPrice.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Tabelas limpas com sucesso.');
}

async function seedUsers() {
  console.log('A criar utilizadores de exemplo...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const adminUser = await prisma.user.create({ data: { name: 'Administrador AgroMaq', email: 'admin@agromaq.com', phone: '11999999999', password: hashedPassword, role: 'ADMIN', isVerified: true } });
  const user1 = await prisma.user.create({ data: { name: 'João da Silva', email: 'joao.silva@email.com', phone: '11988888888', password: hashedPassword, role: 'USER', isVerified: true } });
  const user2 = await prisma.user.create({ data: { name: 'Maria Oliveira', email: 'maria.oliveira@email.com', phone: '11977777777', password: hashedPassword, role: 'USER', isVerified: true } });
  const user3 = await prisma.user.create({ data: { name: 'Carlos Pereira', email: 'carlos.pereira@email.com', phone: '11966666666', password: hashedPassword, role: 'USER' } });
  const user4 = await prisma.user.create({ data: { name: 'Ana Costa', email: 'ana.costa@email.com', phone: '11955555555', password: hashedPassword, role: 'USER' } });
  const user5 = await prisma.user.create({ data: { name: 'Pedro Souza', email: 'pedro.souza@email.com', phone: '11944444444', password: hashedPassword, role: 'USER' } });
  
  console.log('Utilizadores criados.');
  return { adminUser, user1, user2, user3, user4, user5 };
}

async function seedCommodities() {
  console.log('A criar cotações de commodities...');
  const initialDolar = await getInitialDolarPrice();
  const commodities = [
    { id: 'BOI_GORDO', name: 'Boi Gordo', price: 225.80, variation: 0.55 },
    { id: 'SOJA', name: 'Soja', price: 135.50, variation: -1.20 },
    { id: 'MILHO', name: 'Milho', price: 58.70, variation: 2.15 },
    { id: 'CAFE', name: 'Café', price: 1150.00, variation: -0.85 },
    { id: 'DOLAR', name: 'Dólar', price: initialDolar, variation: 0.10 },
    { id: 'OURO', name: 'Ouro', price: 380.50, variation: 1.50 },
  ];
  for (const commodity of commodities) {
    await prisma.commodityPrice.upsert({
      where: { id: commodity.id },
      update: { price: commodity.price, variation: commodity.variation },
      create: commodity
    });
  }
  console.log('Cotações criadas.');
}

async function seedPosts(adminUser) {
  console.log('A criar artigos do blog...');
  // ATUALIZAÇÃO: Usei as imagens de fazenda como placeholders para os posts
  const postImages = [
    applyTransforms('https://res.cloudinary.com/ddbhf4qut/image/upload/v1762725053/fazendas-1024x620.jpg_lpmb7f.webp', true),
    applyTransforms('https://res.cloudinary.com/ddbhf4qut/image/upload/v1762724575/cenario-de-produtos-naturais-fazenda-e-luz-solar_baaoop.jpg', true),
    applyTransforms('https://res.cloudinary.com/ddbhf4qut/image/upload/v1762725053/meliponario_qen7m2.jpg', true),
  ];

  const postsData = [
    { title: 'Sua Colheitadeira Parou na Safra? O Custo Oculto de Equipamento Desatualizado.', slug: 'custo-oculto-equipamento-desatualizado', excerpt: 'Uma máquina parada no pico da colheita não é apenas um incómodo, é uma hemorragia financeira. Descubra por que o investimento em equipamento moderno não é um luxo, mas uma necessidade.', content: htmlToEditorJs(`<h2>O Prejuízo que Não Aparece na Fatura</h2><p>Quando uma máquina antiga avaria, o custo da reparação é apenas a ponta do iceberg. O verdadeiro prejuízo está no que não se vê: perda de produtividade, qualidade do grão e custos de mão de obra.</p>`), imageUrl: postImages[0], status: 'PUBLISHED', publishedAt: new Date(), authorId: adminUser.id },
    { title: 'Terra à Vista: 3 Sinais de que Está na Hora de Expandir a Sua Propriedade', slug: 'sinais-para-expandir-propriedade', excerpt: 'A sua operação cresceu, a sua ambição também. Mas como saber o momento certo para dar o próximo passo e adquirir mais terra? Identifique os sinais e planeie a sua expansão de forma estratégica.', content: htmlToEditorJs(`<h2>Sinal 1: A Sua Terra Atingiu o Limite</h2><p>Você já otimizou tudo, mas a operação está "estrangulada". A sua terra ficou pequena para a sua competência.</p>`), imageUrl: postImages[1], status: 'PUBLISHED', publishedAt: new Date(), authorId: adminUser.id },
    { title: 'O Guia Definitivo para Financiar Sua Próxima Máquina Agrícola', slug: 'guia-financiar-maquina-agricola', excerpt: 'Comprar uma máquina nova não precisa de descapitalizar o seu negócio. Com o planeamento certo e as linhas de crédito corretas, o seu novo equipamento paga-se a si mesmo. Saiba como.', content: htmlToEditorJs(`<h2>Passo 1: Conheça as Suas Opções</h2><p>O mercado oferece diversas linhas de crédito específicas para o produtor rural. As mais conhecidas são Pronaf, Pronamp e Moderfrota. Pesquise e compare!</p>`), imageUrl: postImages[2], status: 'PUBLISHED', publishedAt: new Date(), authorId: adminUser.id },
  ];
  for (const post of postsData) {
    await prisma.post.upsert({ where: { slug: post.slug }, update: {}, create: post });
  }
  console.log('Artigos do blog criados.');
}

async function seedMaquinas(users) {
  console.log('A criar anúncios de máquinas...');
  const maquinasData = [
    { data: { nome: 'Trator Valtra A950', slug: 'trator-valtra-a950', preco: BigInt('15000000'), tipo: 'Trator', marca: 'Valtra', ano: 2021, horas: 1800, estado: 'RS', cidade: 'Passo Fundo', status: 'ATIVO', user: { connect: { id: users.user1.id } } }, images: tratorValtraImages },
    { data: { nome: 'Pulverizador Stara Imperador', slug: 'pulverizador-stara-imperador', preco: BigInt('65000000'), tipo: 'Pulverizador', marca: 'Stara', ano: 2023, horas: 500, estado: 'BA', cidade: 'Luís Eduardo Magalhães', status: 'ATIVO', user: { connect: { id: users.user2.id } } }, images: pulverizadorStaraImages },
    { data: { nome: 'Trator Massey Ferguson 4292', slug: 'trator-massey-ferguson-4292', preco: BigInt('12000000'), tipo: 'Trator', marca: 'Massey Ferguson', ano: 2019, horas: 3200, estado: 'SC', cidade: 'Chapecó', status: 'PAUSADO', user: { connect: { id: users.user3.id } } }, images: tratorValtraImages }, // Reutilizando imagens para poluir
    { data: { nome: 'Plantadeira John Deere DB40', slug: 'plantadeira-john-deere-db40', preco: BigInt('32000000'), tipo: 'Plantadeira', marca: 'John Deere', ano: 2022, horas: 900, estado: 'GO', cidade: 'Jataí', status: 'ATIVO', user: { connect: { id: users.adminUser.id } } }, images: plantadeiraImages },
    { data: { nome: 'Caminhão Scania R450', slug: 'caminhao-scania-r450', preco: BigInt('55000000'), tipo: 'Cavalo Mecânico', marca: 'Scania', ano: 2020, horas: 150000, estado: 'SP', cidade: 'São Paulo', status: 'SUSPENSO', suspensionReason: 'Documentação pendente de verificação.', user: { connect: { id: users.user5.id } } }, images: tratorValtraImages }, // Reutilizando
  ];
  
  let createdMaquinas = [];
  for (const item of maquinasData) {
    const anuncio = await prisma.anuncioMaquina.create({
      data: {
        ...item.data,
        imagens: { create: item.images } // <-- ATUALIZADO para usar as listas de imagens
      }
    });
    createdMaquinas.push(anuncio);
  }
  console.log('Anúncios de máquinas criados.');
  return createdMaquinas;
}

async function seedFazendas(users) {
  console.log('A criar anúncios de fazendas...');
  const fazendasData = [
    { data: { titulo: 'Fazenda a 100km de Itumbiara', slug: 'fazenda-proxima-a-itumbiara', preco: BigInt('1200000000'), estado: 'GO', cidade: 'Itumbiara', area_total_hectares: 1200, status: 'ATIVO', user: { connect: { id: users.adminUser.id } } }, images: fazendaImages1 },
    { data: { titulo: 'Terra para Pasto em Mato Grosso', slug: 'terra-pasto-mato-grosso', preco: BigInt('800000000'), estado: 'MT', cidade: 'Cuiabá', area_total_hectares: 1000, status: 'ATIVO', user: { connect: { id: users.user2.id } } }, images: fazendaImages1.slice(1, 4) }, // Reutilizando
    { data: { titulo: 'Sítio com Casa Sede em Minas Gerais', slug: 'sitio-casa-sede-minas-gerais', preco: BigInt('150000000'), estado: 'MG', cidade: 'Uberaba', area_total_hectares: 80, status: 'PAUSADO', user: { connect: { id: users.user3.id } } }, images: fazendaImages1.slice(2, 5) }, // Reutilizando
    { data: { titulo: 'Fazenda de Café no Sul de Minas', slug: 'fazenda-cafe-sul-de-minas', preco: BigInt('2500000000'), estado: 'MG', cidade: 'Varginha', area_total_hectares: 300, status: 'SUSPENSO', suspensionReason: 'Anúncio duplicado.', user: { connect: { id: users.user4.id } } }, images: fazendaImages1.slice(0, 3) }, // Reutilizando
  ];

  let createdFazendas = [];
  for (const item of fazendasData) {
    const anuncio = await prisma.anuncioFazenda.create({
      data: {
        ...item.data,
        imagens: { create: item.images } // <-- ATUALIZADO para usar as listas de imagens
      }
    });
    createdFazendas.push(anuncio);
  }
  console.log('Anúncios de fazendas criados.');
  return createdFazendas;
}

async function seedLogs(users, maquinas, fazendas) {
  // ... (Sua função original - está ótima!)
  console.log('A criar logs de atividade iniciais...');
  const activityLogs = [];
  
  const userMap = new Map();
  Object.values(users).forEach(user => userMap.set(user.id, user.name));

  for (const maquina of maquinas) {
    activityLogs.push({
      actorId: maquina.userId,
      actorName: userMap.get(maquina.userId) || 'Usuário Desconhecido',
      action: 'CREATE_AD',
      targetType: 'AnuncioMaquina',
      targetId: maquina.id.toString(),
      details: { message: `Anúncio "${maquina.nome}" criado via seed.` }
    });
  }
  for (const fazenda of fazendas) {
    activityLogs.push({
      actorId: fazenda.userId,
      actorName: userMap.get(fazenda.userId) || 'Usuário Desconhecido',
      action: 'CREATE_AD',
      targetType: 'AnuncioFazenda',
      targetId: fazenda.id.toString(),
      details: { message: `Anúncio "${fazenda.titulo}" criado via seed.` }
    });
  }
  await prisma.activityLog.createMany({ data: activityLogs });
  console.log(`${activityLogs.length} logs de atividade iniciais criados.`);
}


// --- FUNÇÃO PRINCIPAL (O "DIRETOR") ---

async function main() {
  try {
    console.log('A iniciar o processo de seed abrangente...');
    
    // 1. Limpeza
    await clearDatabase();
    
    // 2. Criar entidades base
    const users = await seedUsers();
    await seedCommodities();
    await seedPosts(users.adminUser);
    
    // 3. Criar anúncios (que dependem de usuários)
    const maquinas = await seedMaquinas(users);
    const fazendas = await seedFazendas(users);

    // 4. Criar logs (que dependem de usuários e anúncios)
    await seedLogs(users, maquinas, fazendas);

    console.log('Processo de seed abrangente concluído com sucesso!');
  } catch (e) {
    console.error('Ocorreu um erro durante o processo de seed:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();