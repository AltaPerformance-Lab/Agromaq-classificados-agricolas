'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { BookmarkIcon as BookmarkOutlineIcon, ShareIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import CommodityWidget from '@/app/components/CommodityWidget';
import BlogSearch from '../BlogSearch';

// --- NOVO: Componente para renderizar o conteúdo do Editor.js ---
const PostRenderer = ({ data }) => {
    if (!data || !data.blocks) {
        return <p>Conteúdo indisponível.</p>;
    }

    return (
        <div className="prose prose-lg max-w-none prose-h2:font-bold prose-h2:text-gray-800 prose-p:text-gray-700 prose-a:text-yellow-600 hover:prose-a:text-yellow-700">
            {data.blocks.map((block) => {
                switch (block.type) {
                    case 'header':
                        const Tag = `h${block.data.level}`;
                        return <Tag key={block.id} dangerouslySetInnerHTML={{ __html: block.data.text }} />;
                    case 'paragraph':
                        return <p key={block.id} dangerouslySetInnerHTML={{ __html: block.data.text }} />;
                    case 'list':
                        const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
                        return (
                            <ListTag key={block.id}>
                                {block.data.items.map((item, index) => (
                                    <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                                ))}
                            </ListTag>
                        );
                    case 'quote':
                        return (
                             <blockquote key={block.id} className="border-l-4 border-gray-300 pl-4 italic">
                                <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
                                {block.data.caption && <footer className="text-sm text-gray-500 mt-2" dangerouslySetInnerHTML={{ __html: block.data.caption }} />}
                            </blockquote>
                        )
                    default:
                        return null;
                }
            })}
        </div>
    );
};


export default function PostPageClient({ post, commodityPrices, initialInteractions }) {
     if (!post) {
        return <p className="text-center my-12">A carregar artigo...</p>;
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt,
        "image": `${baseUrl}${post.imageUrl}`,
        "author": { "@type": "Person", "name": post.author.name },
        "publisher": { "@type": "Organization", "name": "AgroMaq", "logo": { "@type": "ImageObject", "url": `${baseUrl}/logo.png` } },
        "datePublished": new Date(post.publishedAt).toISOString(),
        "dateModified": new Date(post.updatedAt).toISOString()
    };
    
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <div className="bg-white py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <article>
                        <header className="mb-8">
                             <div className="mb-4 text-sm text-gray-600">
                                <Link href="/blog" className="hover:text-yellow-600">Voltar para o Blog</Link>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">{post.title}</h1>
                            <p className="mt-4 text-lg text-gray-500">{post.excerpt}</p>
                            <div className="mt-6 text-sm text-gray-500">
                                <span>Por {post.author.name}</span>
                                <span className="mx-2">•</span>
                                <span>Publicado em {new Date(post.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </header>

                        {commodityPrices && commodityPrices.length > 0 && <CommodityWidget prices={commodityPrices} />}
                        
                        <PostInteractionBar post={post} initialInteractions={initialInteractions} />

                        <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden my-8 shadow-lg">
                            <Image
                                src={post.imageUrl}
                                alt={`Imagem de capa do artigo: ${post.title}`}
                                fill
                                style={{objectFit: 'cover'}}
                                priority
                                sizes="(max-width: 768px) 100vw, 896px"
                            />
                        </div>
                        
                        {/* Usamos o nosso novo renderizador para o conteúdo JSON */}
                        <PostRenderer data={post.content} />
                    </article>

                    <div className="mt-12 border-t pt-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Pesquisar outros artigos</h2>
                        <BlogSearch initialQuery="" />
                    </div>
                </div>
            </div>
        </>
    );
}

// --- Componentes de UI Internos ---

function PostInteractionBar({ post, initialInteractions }) {
    const { data: session } = useSession();
    const [isFavorite, setIsFavorite] = useState(initialInteractions.isFavorite);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: post.title,
                text: post.excerpt,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copiado para a área de transferência!');
        }
    };

    const handleFavorite = async () => {
        if (!session) {
            alert('Você precisa estar logado para favoritar.');
            return;
        }
        
        setIsFavorite(!isFavorite);
        // TODO: Chamar a API para salvar a interação
    };

    return (
        <div className="flex items-center space-x-4 text-gray-500 my-8 border-y py-4">
            <button onClick={handleFavorite} className="flex items-center space-x-2 hover:text-yellow-600 transition-colors" title="Favoritar">
                {isFavorite ? <BookmarkSolidIcon className="h-6 w-6 text-yellow-500" /> : <BookmarkOutlineIcon className="h-6 w-6" />}
                <span className="font-semibold">Favoritar</span>
            </button>
            <button onClick={handleShare} className="flex items-center space-x-2 hover:text-yellow-600 transition-colors" title="Compartilhar">
                <ShareIcon className="h-6 w-6" />
                <span className="font-semibold">Compartilhar</span>
            </button>
        </div>
    );
}

