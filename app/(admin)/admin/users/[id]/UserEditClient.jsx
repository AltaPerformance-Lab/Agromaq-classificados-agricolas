'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { 
    PhoneIcon, EnvelopeIcon, XCircleIcon, EyeIcon, 
    PencilIcon, TrashIcon, PauseIcon, PlayIcon, CurrencyDollarIcon, 
    TicketIcon, NewspaperIcon 
} from '@heroicons/react/24/solid';

// --- Componentes de UI Internos ---

const StatCard = ({ title, value, icon, color = 'text-gray-800' }) => (
    <div className="bg-gray-50 p-4 rounded-lg flex items-center">
        <div className={`mr-4 ${color}`}>{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    let colorClasses = 'bg-gray-100 text-gray-800';
    let text = status;
    switch (status) {
        case 'ATIVO': colorClasses = 'bg-green-100 text-green-800'; text = 'Ativo'; break;
        case 'PAUSADO': colorClasses = 'bg-yellow-100 text-yellow-800'; text = 'Pausado'; break;
        case 'SUSPENSO': colorClasses = 'bg-orange-100 text-orange-800'; text = 'Suspenso'; break;
    }
    return <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses}`}>{text}</span>;
};

// --- Modal para Suspensão de Anúncios ---
const SuspensionModal = ({ anuncio, onClose, onConfirm }) => {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            alert('O motivo da suspensão é obrigatório.');
            return;
        }
        setIsSubmitting(true);
        await onConfirm(reason);
        setIsSubmitting(false);
    };

    if (!anuncio) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-gray-900">Suspender Anúncio</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Você está a suspender o anúncio: <span className="font-semibold">{anuncio.nome || anuncio.titulo}</span>.
                </p>
                <form onSubmit={handleSubmit} className="mt-4">
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Motivo da Suspensão</label>
                        <textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                            rows="4"
                            placeholder="Ex: Fotos de baixa qualidade, informações incorretas..."
                        />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">
                            {isSubmitting ? 'A Suspender...' : 'Confirmar Suspensão'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default function UserEditClient({ user, stats, announcements, availableRoles }) {
    const router = useRouter();
    const [announcementsList, setAnnouncementsList] = useState(announcements);
    const [suspensionModal, setSuspensionModal] = useState({ isOpen: false, anuncio: null });

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
        }
    });

    const onSubmit = async (data) => {
        try {
            const response = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                alert('Utilizador atualizado com sucesso!');
                router.refresh();
            } else {
                 const result = await response.json();
                 alert(`Erro: ${result.error || 'Não foi possível atualizar o utilizador.'}`);
            }
        } catch (error) {
             alert('Ocorreu um erro de rede. Tente novamente.');
        }
    };

    const handleModerateAnnouncement = async (anuncio, newStatus, reason = '') => {
        const actionText = newStatus === 'ATIVO' ? 'reativar' : 'suspender';
        
        if (newStatus === 'ATIVO') {
            if (!confirm(`Tem a certeza que quer ${actionText} este anúncio?`)) return;
        }
        
        if (newStatus === 'SUSPENSO' && !reason) {
            setSuspensionModal({ isOpen: true, anuncio });
            return;
        }

        try {
            const response = await fetch('/api/admin/anuncios/moderate', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: anuncio.type,
                    id: anuncio.id,
                    status: newStatus,
                    reason,
                }),
            });

            if (response.ok) {
                alert(`Anúncio ${actionText} com sucesso!`);
                setAnnouncementsList(currentList => 
                    currentList.map(ad => 
                        ad.id === anuncio.id && ad.type === anuncio.type ? { ...ad, status: newStatus } : ad
                    )
                );
                setSuspensionModal({ isOpen: false, anuncio: null });
            } else {
                const result = await response.json();
                alert(`Erro: ${result.error || `Não foi possível ${actionText} o anúncio.`}`);
            }
        } catch (error) {
             alert('Ocorreu um erro de rede. Tente novamente.');
        }
    };


    return (
        <>
            <div className="space-y-6">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm flex flex-wrap gap-4 justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition">Adicionar Créditos</button>
                        <button className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition">Apagar Utilizador</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Contato e Verificação</h3>
                        <div className="space-y-4">
                            <div className="flex items-center"><PhoneIcon className="h-5 w-5 text-gray-400 mr-3" /><span className="text-gray-700">{user.phone || 'Não informado'}</span></div>
                            <div className="flex items-center"><XCircleIcon className="h-5 w-5 text-red-500 mr-3" /><span className="text-gray-700">Email Não Verificado</span></div>
                        </div>
                    </div>
                     <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="font-semibold mb-4">Estatísticas Financeiras</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <StatCard title="Gasto Total" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.financial.totalSpent)} icon={<CurrencyDollarIcon className="h-6 w-6"/>} color="text-green-600" />
                            <StatCard title="Créditos Atuais" value={stats.financial.currentCredits} icon={<TicketIcon className="h-6 w-6"/>} color="text-blue-600" />
                        </div>
                    </div>
                     <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="font-semibold mb-4">Estatísticas de Anúncios</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <StatCard title="Total" value={stats.announcements.total} icon={<NewspaperIcon className="h-6 w-6"/>} />
                            <StatCard title="Ativos" value={stats.announcements.active} icon={<NewspaperIcon className="h-6 w-6"/>} color="text-green-500" />
                            <StatCard title="Pausados" value={stats.announcements.paused} icon={<NewspaperIcon className="h-6 w-6"/>} color="text-yellow-500" />
                            <StatCard title="Suspensos" value={stats.announcements.suspended} icon={<NewspaperIcon className="h-6 w-6"/>} color="text-orange-500" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold mb-4">Editar Dados do Utilizador</h3>
                     <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
                            <input id="name" {...register('name', { required: 'Nome é obrigatório' })} className="w-full mt-1 p-2 border border-gray-300 rounded-md" />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                        </div>
                         <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                            <input id="phone" {...register('phone')} className="w-full mt-1 p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Nível de Acesso</label>
                            <select id="role" {...register('role')} className="w-full mt-1 p-2 border border-gray-300 rounded-md">
                                {availableRoles.map(role => <option key={role} value={role}>{role}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button type="submit" disabled={isSubmitting} className="bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition disabled:opacity-50">
                                {isSubmitting ? 'A Salvar...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold mb-4">Anúncios do Utilizador</h3>
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Anúncio</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {announcementsList.map((ad) => (
                                    <tr key={`${ad.type}-${ad.id}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="font-medium text-gray-900">{ad.nome || ad.titulo}</p>
                                            <p className="text-sm text-gray-500 capitalize">{ad.type}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={ad.status} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                             <div className="flex items-center justify-end space-x-2">
                                                <button onClick={() => handleModerateAnnouncement(ad, ad.status === 'ATIVO' ? 'SUSPENSO' : 'ATIVO')} className="p-1 rounded-full text-gray-400 hover:bg-gray-200" title={ad.status === 'ATIVO' ? 'Suspender' : 'Reativar'}>
                                                    {ad.status === 'ATIVO' ? <PauseIcon className="h-5 w-5 hover:text-orange-600" /> : <PlayIcon className="h-5 w-5 hover:text-green-600" />}
                                                </button>
                                                <Link href={`/anuncio/${ad.type}/${ad.slug}`} target="_blank" className="p-1 rounded-full text-gray-400 hover:bg-gray-200" title="Ver"><EyeIcon className="h-5 w-5 hover:text-indigo-600" /></Link>
                                                <Link href={`/anuncio/${ad.type}/${ad.slug}/edit`} className="p-1 rounded-full text-gray-400 hover:bg-gray-200" title="Editar"><PencilIcon className="h-5 w-5 hover:text-gray-800" /></Link>
                                                <button className="p-1 rounded-full text-gray-400 hover:bg-gray-200" title="Apagar"><TrashIcon className="h-5 w-5 hover:text-red-600" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {suspensionModal.isOpen && (
                <SuspensionModal 
                    anuncio={suspensionModal.anuncio}
                    onClose={() => setSuspensionModal({ isOpen: false, anuncio: null })}
                    onConfirm={(reason) => handleModerateAnnouncement(suspensionModal.anuncio, 'SUSPENSO', reason)}
                />
            )}
        </>
    );
}

