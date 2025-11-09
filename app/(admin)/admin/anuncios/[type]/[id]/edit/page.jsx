import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect, notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import AnuncioEditFormAdmin from './AnuncioEditFormAdmin';

// Função de ajuda para garantir que os dados podem ser enviados para o Client Component
function makeSerializable(obj) {
    if (!obj) return null; // Adiciona segurança para objetos nulos
    return JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
}

async function getAnuncio(type, id) {
    const anuncioId = parseInt(id, 10);
    if (isNaN(anuncioId)) {
        return null;
    }

    const model = type === 'maquina' ? prisma.anuncioMaquina : prisma.anuncioFazenda;
    
    const anuncio = await model.findUnique({
        where: { id: anuncioId },
    });

    return anuncio;
}

export default async function AdminEditAnuncioPage({ params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/login');
    }

    const { type, id } = params;
    if (type !== 'maquina' && type !== 'fazenda') {
        notFound();
    }

    const anuncio = await getAnuncio(type, id);

    if (!anuncio) {
        notFound();
    }
    
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Editar Anúncio</h1>
                <p className="text-gray-600 mt-1">A fazer alterações no anúncio: <span className="font-semibold">{anuncio.nome || anuncio.titulo}</span></p>
            </div>
            {/* --- CORREÇÃO: A prop foi renomeada para 'anuncio' para corresponder ao que o formulário espera --- */}
            <AnuncioEditFormAdmin anuncio={makeSerializable(anuncio)} type={type} />
        </div>
    );
}

