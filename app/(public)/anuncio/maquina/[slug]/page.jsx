import React from 'react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import {
    CheckCircleIcon, XCircleIcon, ShieldExclamationIcon, TagIcon, BookmarkIcon,
    CalendarDaysIcon, SparklesIcon, ClockIcon, BoltIcon, Cog6ToothIcon,
    AdjustmentsHorizontalIcon, InboxIcon, BriefcaseIcon, CircleStackIcon
} from '@heroicons/react/24/outline';
import ImageGallery from '@/app/components/ImageGallery';
import Link from 'next/link';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ReportButton from '@/app/components/ReportButton'; // Importa o novo componente

// --- Lógica de Acesso a Dados (Sem Alterações) ---

async function getPublicAnuncio(slug) {
    return await prisma.anuncioMaquina.findUnique({
        where: { slug, status: 'ATIVO', deletedAt: null },
        include: {
            user: { select: { name: true, phone: true } },
            imagens: true,
        },
    });
}

async function getAnuncioForAdmin(slug) {
    return await prisma.anuncioMaquina.findUnique({
        where: { slug },
        include: {
            user: { select: { name: true, phone: true } },
            imagens: true,
        },
    });
}

async function getRelatedAnuncios(currentAnuncio) {
    return prisma.anuncioMaquina.findMany({
        where: {
            tipo: currentAnuncio.tipo,
            id: { not: currentAnuncio.id },
            status: 'ATIVO',
            deletedAt: null,
        },
        take: 4,
        include: {
            imagens: { where: { isPrincipal: true }, take: 1 },
        },
    });
}

// --- SEO: Função para gerar metadados dinâmicos (Sem Alterações) ---
export async function generateMetadata({ params }) {
    const anuncio = await getPublicAnuncio(params.slug);
    if (!anuncio) {
        return { title: "Anúncio não encontrado", description: "Este anúncio não está mais disponível." };
    }
    const priceString = formatCurrency(anuncio.preco);
    const description = `Detalhes sobre ${anuncio.nome} à venda em ${anuncio.cidade}, ${anuncio.estado}. Marca: ${anuncio.marca}, Ano: ${anuncio.ano}. Preço: ${priceString}. Encontre na AgroMaq.`;

    return {
        title: `${anuncio.nome} | AgroMaq`,
        description: description,
        openGraph: {
            title: `${anuncio.nome} | AgroMaq`,
            description: description,
            images: [{ url: `${process.env.NEXT_PUBLIC_BASE_URL}${anuncio.imagens[0]?.url || '/placeholder.jpg'}`, width: 1200, height: 630, alt: `Imagem de ${anuncio.nome}` }],
        },
    };
}

// --- Componentes de UI Internos ---

function AdminAlert({ status, deletedAt }) {
    if (status === 'ATIVO' && !deletedAt) return null;
    let message = 'Este anúncio não está visível para o público.';
    if (deletedAt) message = 'Este anúncio encontra-se na lixeira.';
    else if (status === 'PAUSADO') message = 'Este anúncio está pausado pelo anunciante.';
    else if (status === 'SUSPENSO') message = 'Este anúncio foi suspenso pela moderação.';
    else if (status === 'VENDIDO') message = 'Este anúncio foi marcado como vendido.';
    return (
        <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md" role="alert">
            <div className="flex">
                <div className="py-1"><ShieldExclamationIcon className="h-6 w-6 text-yellow-500 mr-3" /></div>
                <div>
                    <p className="font-bold">Visão de Administrador</p>
                    <p className="text-sm">{message}</p>
                </div>
            </div>
        </div>
    );
}

const Breadcrumbs = ({ anuncio }) => (
    <nav className="mb-4 text-sm text-gray-600">
        <Link href="/" className="hover:text-yellow-600">Página Inicial</Link>
        <span className="mx-2">&gt;</span>
        <Link href="/" className="hover:text-yellow-600">Máquinas e Veículos</Link>
        <span className="mx-2">&gt;</span>
        <span className="text-gray-800 font-semibold">{anuncio.nome}</span>
    </nav>
);

const SpecItem = ({ label, value, icon: Icon }) => (
    <div className="flex items-start space-x-4">
        {Icon && <Icon className="h-7 w-7 text-yellow-600 mt-1 flex-shrink-0" />}
        <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-lg font-semibold text-gray-900">{value || 'Não informado'}</p>
        </div>
    </div>
);

const FeatureItem = ({ label, value }) => (
    <div className="flex items-center space-x-3">
        {value ? <CheckCircleIcon className="h-6 w-6 text-green-500" /> : <XCircleIcon className="h-6 w-6 text-gray-400" />}
        <span className="text-gray-800">{label}</span>
    </div>
);

const AnuncioCard = ({ anuncio }) => {
    const imageUrl = anuncio.imagens && anuncio.imagens.length > 0 ? anuncio.imagens[0].thumbnailUrl : `https://placehold.co/600x400/e2e8f0/333?text=Sem+Foto`;
    return (
        <Link href={`/anuncio/maquina/${anuncio.slug}`} className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
            <div className="w-full h-48 bg-gray-200"><img src={imageUrl} alt={`Imagem do anúncio: ${anuncio.nome}`} className="w-full h-full object-cover" /></div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-yellow-600 transition-colors flex-grow truncate">{anuncio.nome}</h3>
                <p className="text-sm text-gray-500 mt-1">{anuncio.cidade}, {anuncio.estado}</p>
                <div className="mt-auto pt-4"><p className="text-xl font-extrabold text-gray-900">{formatCurrency(anuncio.preco)}</p></div>
            </div>
        </Link>
    );
};


// --- Página Principal (Server Component com Layout Refatorado) ---
export default async function AnuncioMaquinaDetailsPage({ params }) {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'ADMIN';

    let anuncio;
    if (isAdmin) {
        anuncio = await getAnuncioForAdmin(params.slug);
    } else {
        anuncio = await getPublicAnuncio(params.slug);
    }

    if (!anuncio) notFound();

    const anunciosRelacionados = await getRelatedAnuncios(anuncio);
    const anunciante = anuncio.user;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

    // Verifica se existe alguma informação sobre pneus
    const hasPneusInfo = anuncio.condicao_pneus || anuncio.pneus_dianteiros || anuncio.pneus_traseiros;

    // ... (lógica de dados estruturados permanece a mesma) ...
    const productStructuredData = { "@context": "https://schema.org", "@type": "Product", "name": anuncio.nome, "description": anuncio.descricao || `Anúncio de ${anuncio.nome}, marca ${anuncio.marca}, ano ${anuncio.ano} à venda em ${anuncio.cidade}, ${anuncio.estado}.`, "image": anuncio.imagens.map(img => `${baseUrl}${img.url}`), "sku": anuncio.id.toString(), "brand": { "@type": "Brand", "name": anuncio.marca }, "aggregateRating": { "@type": "AggregateRating", "ratingValue": "5", "reviewCount": "0" }, "offers": { "@type": "Offer", "priceCurrency": "BRL", "price": (Number(anuncio.preco) / 100).toFixed(2), "availability": "https://schema.org/InStock", "seller": { "@type": "Person", "name": anunciante.name } } };
    const breadcrumbStructuredData = { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Página Inicial", "item": `${baseUrl}` }, { "@type": "ListItem", "position": 2, "name": "Máquinas e Veículos", "item": `${baseUrl}` }, { "@type": "ListItem", "position": 3, "name": anuncio.nome }] };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }} />

            <div className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Breadcrumbs anuncio={anuncio} />
                    {isAdmin && <AdminAlert status={anuncio.status} deletedAt={anuncio.deletedAt} />}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                        {/* Coluna da Esquerda: Imagens e Descrição */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{anuncio.nome}</h1>
                                <p className="text-lg text-gray-600">{anuncio.cidade}, {anuncio.estado}</p>
                                <div className="mt-4">
                                    <ImageGallery imagens={anuncio.imagens} altText={`Galeria de imagens de ${anuncio.nome}`} />
                                </div>
                            </div>
                            
                            <div className="lg:hidden bg-white p-6 rounded-lg shadow-sm border">
                                <p className="text-gray-600 text-sm">Valor</p>
                                <p className="text-4xl font-extrabold text-gray-900 mb-6">{formatCurrency(anuncio.preco)}</p>
                                <a href={`https://wa.me/55${anunciante.phone.replace(/\D/g, '')}?text=Olá, tenho interesse no seu anúncio '${anuncio.nome}' que vi na AgroMaq.`} target="_blank" rel="noopener noreferrer" className="w-full block text-center bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition duration-300">
                                    Entrar em Contato
                                </a>
                                <div className="text-center mt-4">
                                    <p className="text-sm text-gray-700">Anunciado por:</p>
                                    <p className="font-semibold text-gray-900">{anunciante.name}</p>
                                </div>
                                <ReportButton anuncioId={anuncio.id} />
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Especificações</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                                    {anuncio.tipo && <SpecItem label="Tipo" value={anuncio.tipo} icon={TagIcon} />}
                                    {anuncio.marca && <SpecItem label="Marca" value={anuncio.marca} icon={BookmarkIcon} />}
                                    {anuncio.ano && <SpecItem label="Ano" value={anuncio.ano} icon={CalendarDaysIcon} />}
                                    {anuncio.condicao && <SpecItem label="Condição" value={anuncio.condicao} icon={SparklesIcon} />}
                                    {anuncio.horas && <SpecItem label="Horas de Uso" value={`${formatNumber(anuncio.horas)} h`} icon={ClockIcon} />}
                                    {anuncio.potencia_motor && <SpecItem label="Potência (cv)" value={anuncio.potencia_motor} icon={BoltIcon} />}
                                    {anuncio.transmissao && <SpecItem label="Transmissão" value={anuncio.transmissao} icon={Cog6ToothIcon} />}
                                    {anuncio.tracao && <SpecItem label="Tração" value={anuncio.tracao} icon={AdjustmentsHorizontalIcon} />}
                                    {anuncio.cabine && <SpecItem label="Cabine" value={anuncio.cabine} icon={InboxIcon} />}
                                    {anuncio.operacao_previa && <SpecItem label="Operação Prévia" value={anuncio.operacao_previa} icon={BriefcaseIcon} />}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Pneus</h2>
                                {hasPneusInfo ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                                        {anuncio.condicao_pneus && <SpecItem label="Condição dos Pneus" value={anuncio.condicao_pneus} icon={CircleStackIcon} />}
                                        {anuncio.pneus_dianteiros && <SpecItem label="Pneus Dianteiros" value={anuncio.pneus_dianteiros} icon={CircleStackIcon} />}
                                        {anuncio.pneus_traseiros && <SpecItem label="Pneus Traseiros" value={anuncio.pneus_traseiros} icon={CircleStackIcon} />}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 px-4 bg-gray-50 rounded-lg">
                                        <p className="text-gray-600 mb-4">Não informado pelo anunciante.</p>
                                        <a 
                                            href={`https://wa.me/55${anunciante.phone.replace(/\D/g, '')}?text=Olá, gostaria de saber mais detalhes sobre os pneus do anúncio '${anuncio.nome}' que vi na AgroMaq.`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="inline-block bg-yellow-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-yellow-600 transition duration-300"
                                        >
                                            Perguntar ao Anunciante
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Opcionais e Características</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <FeatureItem label="Ar Condicionado" value={anuncio.ar_condicionado} />
                                    <FeatureItem label="Lâmina Frontal" value={anuncio.lamina_frontal} />
                                    <FeatureItem label="Carregador Frontal" value={anuncio.carregador_frontal} />
                                    <FeatureItem label="GPS" value={anuncio.gps} />
                                    <FeatureItem label="Piloto Automático" value={anuncio.piloto_automatico} />
                                    <FeatureItem label="Único Dono" value={anuncio.unico_dono} />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm space-y-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Descrição do Anunciante</h2>
                                    {anuncio.descricao ? (
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{anuncio.descricao}</p>
                                    ) : (
                                        <div className="text-center py-8 px-4 bg-gray-50 rounded-lg">
                                            <p className="text-gray-600 mb-4">Não informado pelo anunciante.</p>
                                            <a 
                                                href={`https://wa.me/55${anunciante.phone.replace(/\D/g, '')}?text=Olá, gostaria de saber mais detalhes sobre o anúncio '${anuncio.nome}' que vi na AgroMaq.`} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="inline-block bg-yellow-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-yellow-600 transition duration-300"
                                            >
                                                Perguntar ao Anunciante
                                            </a>
                                        </div>
                                    )}
                                </div>
                                {anuncio.informacoes_adicionais && (
                                    <div className="border-t pt-8">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Informações Adicionais</h2>
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{anuncio.informacoes_adicionais}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Coluna da Direita: Ações (Layout Corrigido para Desktop) */}
                        <div className="hidden lg:block lg:col-span-1">
                             <div className="sticky top-10">
                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                                    <p className="text-gray-600 text-sm">Valor</p>
                                    <p className="text-4xl font-extrabold text-gray-900 mb-6">{formatCurrency(anuncio.preco)}</p>
                                    <a href={`https://wa.me/55${anunciante.phone.replace(/\D/g, '')}?text=Olá, tenho interesse no seu anúncio '${anuncio.nome}' que vi na AgroMaq.`} target="_blank" rel="noopener noreferrer" className="w-full block text-center bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition duration-300">
                                        Entrar em Contato
                                    </a>
                                    <div className="text-center mt-4">
                                        <p className="text-sm text-gray-700">Anunciado por:</p>
                                        <p className="font-semibold text-gray-900">{anunciante.name}</p>
                                    </div>
                                    <ReportButton anuncioId={anuncio.id} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {anunciosRelacionados && anunciosRelacionados.length > 0 && (
                        <div className="mt-12">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Anúncios Semelhantes</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {anunciosRelacionados.map(anuncioRelacionado => <AnuncioCard key={anuncioRelacionado.id} anuncio={anuncioRelacionado} />)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

