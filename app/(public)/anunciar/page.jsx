import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

// Componente para os cartões de categoria
const CategoryCard = ({ href, icon, title, description }) => (
    <Link href={href} className="block bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 text-center">
        <div className="text-5xl mb-4">{icon}</div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="mt-2 text-gray-600">{description}</p>
    </Link>
);

export default async function AnunciarPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login?callbackUrl=/anunciar');
    }

    return (
        <div className="bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900">O que você deseja anunciar?</h1>
                <p className="mt-4 text-lg text-gray-600">Escolha uma categoria para começar.</p>
            </div>

            <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                <CategoryCard
                    href="/anunciar/maquina"
                    icon="🚜"
                    title="Máquinas e Veículos"
                    description="Anuncie tratores, colheitadeiras, pulverizadores, caminhões e outros."
                />
                <CategoryCard
                    href="/anunciar/fazenda"
                    // MUDANÇA: Corrigido o emoji quebrado
                    icon="🏞️"
                    title="Fazendas e Imóveis Rurais"
                    description="Anuncie fazendas, sítios, chácaras e outras propriedades rurais."
                />
            </div>
        </div>
    );
}
