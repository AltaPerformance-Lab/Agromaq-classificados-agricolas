"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatCurrency, formatNumber } from '@/lib/formatters';

// --- Componente do Card de Anúncio Genérico ---
const AnuncioCard = ({ anuncio, type, compareList, onCompareChange }) => {
    const isMaquina = type === 'maquinas';
    const imageUrl = anuncio.imagens && anuncio.imagens.length > 0 ? anuncio.imagens[0].thumbnailUrl : `https://placehold.co/600x400/e2e8f0/333?text=Sem+Foto`;
    const linkHref = `/anuncio/${isMaquina ? 'maquina' : 'fazenda'}/${anuncio.slug}`;

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group flex flex-col">
            <div className="relative">
                {isMaquina && (
                     <div className="absolute top-2 right-2 z-10 bg-white p-1 rounded-full shadow">
                        <input 
                            type="checkbox" 
                            className="h-5 w-5 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500" 
                            checked={compareList.some(item => item.id === anuncio.id)} 
                            onChange={(e) => onCompareChange(anuncio, e.target.checked)} 
                        />
                    </div>
                )}
                <Link href={linkHref}>
                    <div className="w-full h-48 bg-gray-200">
                        <img src={imageUrl} alt={anuncio.titulo || anuncio.nome} className="w-full h-full object-cover" />
                    </div>
                </Link>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                 <h3 className="text-lg font-bold text-gray-900 group-hover:text-yellow-600 transition-colors flex-grow">
                    <Link href={linkHref}>{anuncio.titulo || anuncio.nome}</Link>
                </h3>
                
                {isMaquina && (
                    <div className="flex flex-wrap gap-2 my-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{anuncio.tipo}</span>
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{anuncio.marca}</span>
                    </div>
                )}

                {isMaquina ? (
                     <p className="text-sm text-gray-600 mt-1">Ano: {anuncio.ano} | {formatNumber(anuncio.horas)} horas</p>
                ) : (
                    <p className="text-base text-gray-600 mt-2">{formatNumber(anuncio.area_total_hectares)} ha</p>
                )}
                <p className="text-sm text-gray-500 mt-1">{anuncio.cidade}, {anuncio.estado}</p>
                <div className="mt-auto pt-4">
                    <p className="text-xl font-extrabold text-gray-900">{formatCurrency(anuncio.preco)}</p>
                </div>
            </div>
        </div>
    );
};


// --- Componente de Paginação ---
const Paginator = ({ currentPage, totalPages }) => {
    const searchParams = useSearchParams();
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    const createPageUrl = (page) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        return `/?${params.toString()}`;
    };

    return (
        <nav className="flex items-center justify-center space-x-2">
            {pages.map(page => (
                <Link key={page} href={createPageUrl(page)} className={`px-4 py-2 rounded-md text-sm font-medium ${currentPage === page ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                    {page}
                </Link>
            ))}
        </nav>
    );
};


// --- Componente Principal do Cliente ---
export default function HomePageClient({ 
    initialAnuncios, 
    totalPages, 
    featuredAnuncios, 
    featuredTitle, 
    listTitle,
    category,
    hasFilters 
}) {
    const [compareList, setCompareList] = useState([]);
    const [showMessage, setShowMessage] = useState(false);
    const searchParams = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    const handleCompareChange = (maquina, isChecked) => {
        setCompareList(currentList => {
            if (isChecked) {
                if (currentList.length < 3) {
                    return [...currentList, maquina];
                } else {
                    setShowMessage(true);
                    setTimeout(() => setShowMessage(false), 3000);
                    return currentList;
                }
            } else {
                return currentList.filter(item => item.id !== maquina.id);
            }
        });
    };

    // CRIA A URL PARA A PÁGINA DE COMPARAÇÃO
    const compareUrl = `/comparar?slugs=${compareList.map(item => item.slug).join(',')}`;

    return (
        <>
            {!hasFilters && featuredAnuncios.length > 0 && (
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8">{featuredTitle}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredAnuncios.map(anuncio => (
                            <AnuncioCard 
                                key={`feat-${anuncio.id}`} 
                                anuncio={anuncio} 
                                type={category}
                                compareList={compareList}
                                onCompareChange={handleCompareChange}
                            />
                        ))}
                    </div>
                </section>
            )}

            <section>
                <h2 className="text-3xl font-bold text-gray-800 mb-8">{listTitle}</h2>
                {initialAnuncios.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <p className="text-gray-600 text-center">Nenhum anúncio encontrado para os filtros selecionados.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {initialAnuncios.map(anuncio => (
                               <AnuncioCard 
                                    key={`main-${anuncio.id}`} 
                                    anuncio={anuncio} 
                                    type={category}
                                    compareList={compareList}
                                    onCompareChange={handleCompareChange}
                                />
                            ))}
                        </div>
                        <div className="mt-8">
                            {totalPages > 1 && <Paginator currentPage={currentPage} totalPages={totalPages} />}
                        </div>
                    </>
                )}
            </section>

            {showMessage && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-opacity duration-300 z-50">
                    Você pode comparar no máximo 3 máquinas por vez.
                </div>
            )}

            {compareList.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t p-4 z-20">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4 overflow-x-auto">
                            <span className="font-semibold flex-shrink-0">Comparar:</span>
                            {compareList.map(item => (
                                <div key={item.id} className="flex items-center gap-2 flex-shrink-0">
                                    <img src={item.imagens[0]?.thumbnailUrl} alt={item.nome} className="w-10 h-10 rounded object-cover" />
                                    <span className="text-sm hidden sm:block">{item.nome}</span>
                                </div>
                            ))}
                        </div>
                        {/* O BOTÃO AGORA É UM LINK QUE LEVA PARA A PÁGINA DE COMPARAÇÃO */}
                        <Link href={compareUrl} className="bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition duration-300 shadow-sm flex-shrink-0 ml-4">
                            Comparar ({compareList.length})
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}

