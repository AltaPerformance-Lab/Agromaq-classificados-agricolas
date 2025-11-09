import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import DashboardClient from './DashboardClient';

// --- Funções para obter os dados do utilizador ---
async function getUserData(userId) {
    const [maquinas, fazendas, alertas] = await Promise.all([
        prisma.anuncioMaquina.findMany({
            where: { userId, deletedAt: null }, // Apenas anúncios não excluídos
            orderBy: { createdAt: 'desc' },
            include: { imagens: { where: { isPrincipal: true }, take: 1 } }
        }),
        prisma.anuncioFazenda.findMany({
            where: { userId, deletedAt: null },
            orderBy: { createdAt: 'desc' },
            include: { imagens: { where: { isPrincipal: true }, take: 1 } }
        }),
        prisma.alertaBusca.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        })
    ]);

    // --- CORREÇÃO: Serializa o BigInt ANTES de passar para o Client Component ---
    const serializeAnuncios = (anuncios) => anuncios.map(ad => ({
        ...ad,
        preco: ad.preco.toString(),
    }));

    return {
        maquinas: serializeAnuncios(maquinas),
        fazendas: serializeAnuncios(fazendas),
        alertas
    };
}

// --- Página Principal (Server Component) ---
export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect('/login?callbackUrl=/dashboard');
    }

    const userData = await getUserData(parseInt(session.user.id, 10));

    return (
        <DashboardClient
            initialMaquinas={userData.maquinas}
            initialFazendas={userData.fazendas}
            initialAlertas={userData.alertas}
        />
    );
}
