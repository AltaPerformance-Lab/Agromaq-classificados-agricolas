import prisma from '@/lib/prisma';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função para renderizar a descrição da ação de forma mais amigável
function renderLogAction(log) {
    // ATUALIZAÇÃO: Constrói o URL com base na sua estrutura de ficheiros específica
    const getHref = () => {
        if (!log.details?.slug) return '#';
        const type = log.targetType === 'AnuncioMaquina' ? 'maquina' : 'fazenda';
        return `/anuncio/${type}/${log.details.slug}`;
    };

    const targetLink = log.details?.slug ? (
        <Link href={getHref()} className="font-bold text-yellow-600 hover:underline" target="_blank">
            anúncio ID#{log.targetId}
        </Link>
    ) : `anúncio ID#${log.targetId}`;

    switch (log.action) {
        case 'ADMIN_EDIT_AD':
            return <span>O admin <strong>{log.actorName}</strong> editou o {targetLink}.</span>;
        case 'DELETE_AD_IMAGE':
            return <span>O admin <strong>{log.actorName}</strong> apagou uma imagem do {targetLink}. Motivo: {log.reason || 'Não especificado'}.</span>;
        case 'DELETE_AD_LOGICAL':
             return <span>O admin <strong>{log.actorName}</strong> moveu o {targetLink} para a lixeira.</span>;
        default:
            return <span>Ação <strong>{log.action}</strong> realizada por <strong>{log.actorName}</strong> no {targetLink}.</span>;
    }
}

export default async function AdminLogsPage() {
    const logs = await prisma.activityLog.findMany({
        orderBy: {
            timestamp: 'desc',
        },
        take: 100, // Limita aos 100 logs mais recentes para performance
    });

    return (
        <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Logs de Atividade</h1>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {logs.map((log) => (
                                <tr key={log.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {format(new Date(log.timestamp), "dd 'de' MMM, yyyy 'às' HH:mm:ss", { locale: ptBR })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-800">
                                        {renderLogAction(log)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {logs.length === 0 && (
                    <p className="p-6 text-center text-gray-500">Nenhum registo de atividade encontrado.</p>
                )}
            </div>
        </div>
    );
}

