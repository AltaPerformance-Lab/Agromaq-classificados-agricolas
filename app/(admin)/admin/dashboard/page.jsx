import AdminDashboardClient from './AdminDashboardClient';
import prisma from '@/lib/prisma';
import { subDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// --- FUNÇÃO PARA BUSCAR OS DADOS NO SERVIDOR ---
async function getAdminDashboardData() {
    const [totalUtilizadores, totalMaquinas, totalFazendas] = await Promise.all([
        prisma.user.count(),
        prisma.anuncioMaquina.count({ where: { deletedAt: null } }),
        prisma.anuncioFazenda.count({ where: { deletedAt: null } }),
    ]);

    const sevenDaysAgo = subDays(new Date(), 7);
    const userSignups = await prisma.user.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
    });
    
    const chartLabels = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(new Date(), 6 - i);
        return format(date, "d 'de' MMM", { locale: ptBR });
    });

    const chartDataPoints = chartLabels.map(label => {
        return userSignups.filter(signup => format(new Date(signup.createdAt), "d 'de' MMM", { locale: ptBR }) === label).length;
    });

    const recentUsers = await prisma.user.findMany({ take: 3, orderBy: { createdAt: 'desc' } });
    const recentMaquinas = await prisma.anuncioMaquina.findMany({ take: 3, orderBy: { createdAt: 'desc' } });
    const recentFazendas = await prisma.anuncioFazenda.findMany({ take: 3, orderBy: { createdAt: 'desc' } });

    const combinedActivities = [
        ...recentUsers.map(u => ({ ...u, type: 'user', time: u.createdAt })),
        ...recentMaquinas.map(m => ({ ...m, type: 'maquina', time: m.createdAt })),
        ...recentFazendas.map(f => ({ ...f, type: 'fazenda', time: f.createdAt })),
    ];

    const recentActivities = combinedActivities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

    return {
        stats: { totalUtilizadores, totalMaquinas, totalFazendas },
        chartData: { labels: chartLabels, data: chartDataPoints },
        recentActivities,
    };
}

// --- PÁGINA PRINCIPAL (SERVER COMPONENT) ---
// Este componente agora apenas busca os dados.
export default async function AdminDashboardPage() {
    const { stats, chartData, recentActivities } = await getAdminDashboardData();

    // Passa os dados para o Client Component que renderiza a UI.
    return (
        <AdminDashboardClient
            stats={stats}
            chartData={chartData}
            recentActivities={recentActivities}
        />
    );
}
