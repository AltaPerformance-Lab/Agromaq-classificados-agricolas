'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { BookOpenIcon, MegaphoneIcon, UsersIcon, BuildingStorefrontIcon, TruckIcon, BanknotesIcon, BellAlertIcon } from '@heroicons/react/24/outline';

// Regista os componentes do ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Componente de Gráfico, agora dentro do Client Component
function DashboardChart({ chartData }) {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
            },
            y: {
                beginAtZero: true,
            },
        },
    };

    const data = {
        labels: chartData.labels,
        datasets: [
            {
                label: 'Novos Utilizadores',
                data: chartData.data,
                borderColor: 'rgb(251, 191, 36)',
                backgroundColor: 'rgba(251, 191, 36, 0.2)',
                tension: 0.1,
                fill: true,
            },
        ],
    };

    return <Line options={options} data={data} />;
}

// O componente que renderiza a UI completa
export default function AdminDashboardClient({ stats, chartData, recentActivities }) {
    return (
        <div className="bg-gray-100 min-h-screen">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold leading-tight text-gray-900">
                        Painel de Administração
                    </h1>
                </div>
            </header>
            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* --- KPIs --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <KpiCard title="Total de Utilizadores" value={stats.totalUtilizadores} icon={<UsersIcon className="h-8 w-8" />} />
                    <KpiCard title="Anúncios de Máquinas" value={stats.totalMaquinas} icon={<TruckIcon className="h-8 w-8" />} />
                    <KpiCard title="Anúncios de Fazendas" value={stats.totalFazendas} icon={<BuildingStorefrontIcon className="h-8 w-8" />} />
                    <KpiCard title="Faturamento (Exemplo)" value="R$ 1.250" icon={<BanknotesIcon className="h-8 w-8" />} />
                </div>

                {/* --- Gráfico e Atividades Recentes --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Tendência de Novos Utilizadores (Últimos 7 dias)</h3>
                        <div className="h-80">
                           <DashboardChart chartData={chartData} />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center space-x-2 mb-4">
                            <BellAlertIcon className="h-6 w-6 text-gray-500" />
                            <h3 className="text-xl font-semibold text-gray-800">Atividades Recentes</h3>
                        </div>
                        <div className="divide-y divide-gray-200">
                           {recentActivities.map(activity => (
                               <ActivityItem key={`${activity.type}-${activity.id}`} activity={activity} />
                           ))}
                        </div>
                    </div>
                </div>

                 {/* --- Links de Gestão --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AdminCard icon={<BookOpenIcon className="h-8 w-8 text-white" />} title="Gerir Blog" description="Crie, edite e publique artigos para o Blog AgroMaq." href="/dashboard/blog/novo" bgColor="bg-blue-500" />
                    <AdminCard icon={<MegaphoneIcon className="h-8 w-8 text-white" />} title="Gerir Publicidade" description="Adicione e controle os banners e anúncios de parceiros no site." href="/admin/ads" bgColor="bg-green-500" />
                    <AdminCard icon={<UsersIcon className="h-8 w-8 text-white" />} title="Gerir Utilizadores" description="Visualize e administre os utilizadores da plataforma." href="/admin/users" bgColor="bg-yellow-500" />
                </div>
            </main>
        </div>
    );
}


// --- Componentes de UI Internos ---
const KpiCard = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-4 text-yellow-600">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    </div>
);

const ActivityItem = ({ activity }) => {
    // --- CORREÇÃO PARA O ERRO DE HIDRATAÇÃO ---
    // Este estado garante que a formatação da data só acontece no cliente.
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);


    let message = '';
    let link = '#';

    switch (activity.type) {
        case 'user':
            message = <><span className="font-bold">{activity.name}</span> registou-se na plataforma.</>;
            link = `/admin/users/${activity.id}`; // Rota futura
            break;
        case 'maquina':
            message = <>Novo anúncio de máquina: <span className="font-bold">{activity.nome}</span></>;
            link = `/anuncio/maquina/${activity.slug}`;
            break;
        case 'fazenda':
            message = <>Novo anúncio de fazenda: <span className="font-bold">{activity.titulo}</span></>;
            link = `/anuncio/fazenda/${activity.slug}`;
            break;
    }

    return (
        <Link href={link} className="block py-3 px-2 hover:bg-gray-50 rounded-md">
            <p className="text-sm text-gray-800">{message}</p>
            {/* A data só é renderizada no cliente, evitando o erro. */}
            <p className="text-xs text-gray-500 min-h-[16px]">
                {isClient ? new Date(activity.time).toLocaleString('pt-BR') : ''}
            </p>
        </Link>
    );
};

const AdminCard = ({ icon, title, description, href, bgColor }) => (
    <Link href={href} className="block p-6 bg-white rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
        <div className="flex items-center">
            <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md ${bgColor} text-white`}>
                {icon}
            </div>
            <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-yellow-600">{title}</h3>
            </div>
        </div>
        <p className="mt-4 text-gray-600">{description}</p>
    </Link>
);

