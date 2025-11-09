import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import AnunciosClient from './AnunciosClient'; // O caminho foi corrigido aqui

async function getAnuncios(searchParams) {
    const { search = '', page = '1' } = searchParams;
    const currentPage = parseInt(page, 10) || 1;
    const take = 15;
    const skip = (currentPage - 1) * take;

    const whereClause = search ? {
        OR: [
            { nome: { contains: search, mode: 'insensitive' } },
            { titulo: { contains: search, mode: 'insensitive' } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
        ],
    } : {};

    const [maquinas, fazendas, totalMaquinas, totalFazendas] = await Promise.all([
        prisma.anuncioMaquina.findMany({
            where: whereClause,
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.anuncioFazenda.findMany({
            where: whereClause,
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.anuncioMaquina.count({ where: whereClause }),
        prisma.anuncioFazenda.count({ where: whereClause }),
    ]);

    const combined = [
        ...maquinas.map(m => ({ ...m, type: 'maquina' })),
        ...fazendas.map(f => ({ ...f, type: 'fazenda' })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalAnuncios = totalMaquinas + totalFazendas;
    const totalPages = Math.ceil(totalAnuncios / take);

    const paginatedAnuncios = combined.slice(skip, skip + take);

    return { anuncios: paginatedAnuncios, totalPages, currentPage };
}

export default async function AdminAnunciosPage({ searchParams }) {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/login');
    }

    const { anuncios, totalPages, currentPage } = await getAnuncios(searchParams);

    return (
        <AnunciosClient
            initialAnuncios={anuncios}
            totalPages={totalPages}
            currentPage={currentPage}
        />
    );
}

