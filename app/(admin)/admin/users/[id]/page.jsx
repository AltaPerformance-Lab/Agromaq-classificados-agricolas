import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import UserDetailsClient from './UserDetailsClient';
import { notFound } from 'next/navigation';

// Função de ajuda para garantir que os dados podem ser enviados para o Client Component
function makeSerializable(obj) {
    return JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
}

// ATUALIZAÇÃO: A função agora busca também as estatísticas detalhadas do utilizador.
async function getUserDetails(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            anunciosMaquina: { orderBy: { createdAt: 'desc' } },
            anunciosFazenda: { orderBy: { createdAt: 'desc' } },
            activityLogs: { orderBy: { timestamp: 'desc' } },
        },
    });

    if (!user) {
        return null;
    }

    // Calcula as estatísticas
    const stats = {
        total: user.anunciosMaquina.length + user.anunciosFazenda.length,
        active: user.anunciosMaquina.filter(a => a.status === 'ATIVO').length + user.anunciosFazenda.filter(a => a.status === 'ATIVO').length,
        paused: user.anunciosMaquina.filter(a => a.status === 'PAUSADO').length + user.anunciosFazenda.filter(a => a.status === 'PAUSADO').length,
        suspended: user.anunciosMaquina.filter(a => a.status === 'SUSPENSO').length + user.anunciosFazenda.filter(a => a.status === 'SUSPENSO').length,
        deleted: user.anunciosMaquina.filter(a => a.deletedAt !== null).length + user.anunciosFazenda.filter(a => a.deletedAt !== null).length,
    };

    const anuncios = [
        ...user.anunciosMaquina.map(a => ({ ...a, type: 'maquina' })),
        ...user.anunciosFazenda.map(f => ({ ...f, type: 'fazenda' })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    delete user.anunciosMaquina;
    delete user.anunciosFazenda;

    const availableRoles = ['USER', 'ADMIN'];

    return { user, anuncios, activityLogs: user.activityLogs, stats, availableRoles };
}

export default async function AdminUserDetailsPage({ params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/login');
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
        notFound();
    }

    const data = await getUserDetails(userId);

    if (!data) {
        notFound();
    }

    return <UserDetailsClient initialData={makeSerializable(data)} />;
}

