'use client';

import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import * as SolidIcons from '@heroicons/react/24/solid';

// --- FUNÇÕES DE AJUDA ---
const formatPhoneNumber = (phone) => {
    if (!phone) return { display: 'Não informado', link: '' };
    const justDigits = phone.replace(/\D/g, '');
    if (justDigits.length < 10) return { display: phone, link: '' };
    const formatted = justDigits.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
    return { display: formatted, link: `https://wa.me/55${justDigits}` };
};

const translateLogAction = (action) => {
    const translations = {
        CREATE_AD: 'criou um anúncio',
        EDIT_AD: 'editou um anúncio',
        PAUSE_AD: 'pausou um anúncio',
        REACTIVATE_AD_USER: 'reativou um anúncio',
        DELETE_AD_LOGICAL: 'apagou um anúncio',
        SUSPEND_AD: 'suspendeu um anúncio',
        REACTIVATE_AD_ADMIN: 'reativou um anúncio (Admin)',
        DELETE_AD_PERMANENT: 'apagou permanentemente um anúncio',
        ADMIN_EDIT_AD: 'editou um anúncio (Admin)',
        PROMOTE_AD: 'promoveu um anúncio',
        VERIFY_AD: 'verificou um anúncio',
        EDIT_USER: 'editou um utilizador',
        DELETE_USER: 'apagou um utilizador',
        ADD_CREDITS: 'adicionou créditos',
        CREATE_BLOG_POST: 'criou um post no blog',
        EDIT_BLOG_POST: 'editou um post no blog',
        DELETE_BLOG_POST: 'apagou um post no blog',
    };
    return translations[action] || action.replace(/_/g, ' ').toLowerCase();
};

// --- COMPONENTES INTERNOS ---

const StatCard = ({ title, value, iconName, onClick, isActive }) => {
    const Icon = SolidIcons[iconName];
    if (!Icon) return null;
    return (
        <button
            onClick={onClick}
            className={`bg-gray-50 p-4 rounded-lg flex items-center w-full text-left transition-all duration-200 ${isActive ? 'ring-2 ring-yellow-500 shadow-lg' : 'hover:shadow-md'}`}
        >
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </button>
    );
};

const StatusBadge = ({ status, deletedAt }) => {
    let colorClasses = 'bg-gray-100 text-gray-800';
    let text = status;
    if (deletedAt) {
        colorClasses = 'bg-red-100 text-red-800';
        text = 'Excluído';
    } else {
        switch (status) {
            case 'ATIVO': colorClasses = 'bg-green-100 text-green-800'; text = 'Ativo'; break;
            case 'PAUSADO': colorClasses = 'bg-yellow-100 text-yellow-800'; text = 'Pausado'; break;
            case 'SUSPENSO': colorClasses = 'bg-orange-100 text-orange-800'; text = 'Suspenso'; break;
            case 'VENDIDO': colorClasses = 'bg-blue-100 text-blue-800'; text = 'Vendido'; break;
        }
    }
    return <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses}`}>{text}</span>;
};

const LogEntry = ({ log }) => {
    const LogIcon = SolidIcons['ClockIcon'];
    const formattedDate = new Date(log.timestamp).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    return (
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
            <div className="flex-shrink-0">
                {LogIcon && <LogIcon className="h-5 w-5 text-gray-500" />}
            </div>
            <div>
                <p className="text-sm text-gray-800">
                    <span className="font-semibold">{log.actorName}</span>{' '}
                    {translateLogAction(log.action)}
                    {log.targetType && <span className="font-semibold"> ({log.targetType.replace('Anuncio', '')} #{log.targetId})</span>}
                </p>
                <p className="text-xs text-gray-500">{formattedDate}</p>
                {log.reason && <p className="text-xs text-gray-600 mt-1">Motivo: {log.reason}</p>}
            </div>
        </div>
    );
};


const EditUserForm = ({ user, availableRoles, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'USER',
        isVerified: user.isVerified || false,
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const promise = fetch(`/api/admin/users/${user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        toast.promise(promise, {
            loading: 'A guardar alterações...',
            success: async (res) => {
                if (!res.ok) throw new Error('Falha ao atualizar o utilizador.');
                const updatedUser = await res.json();
                onUpdate(updatedUser);
                return 'Utilizador atualizado com sucesso!';
            },
            error: 'Ocorreu um erro ao atualizar.',
        });

        promise.finally(() => setIsLoading(false));
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white border rounded-lg shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Nível de Acesso</label>
                    <select id="role" name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        {availableRoles.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                </div>
                <div className="flex items-center pt-6">
                     <input
                        id="isVerified"
                        name="isVerified"
                        type="checkbox"
                        checked={formData.isVerified}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    <label htmlFor="isVerified" className="ml-2 block text-sm text-gray-900">
                        Utilizador Verificado
                    </label>
                </div>
            </div>
            <div className="flex justify-end">
                <button type="submit" disabled={isLoading} className="inline-flex justify-center py-2 px-4 border shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50">
                    Guardar Alterações
                </button>
            </div>
        </form>
    );
};

const SuspensionModal = ({ anuncio, onClose, onConfirm }) => {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            toast.error('O motivo da suspensão é obrigatório.');
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

// --- COMPONENTE PRINCIPAL ---

export default function UserDetailsClient({ initialData }) {
    const [userData, setUserData] = useState(initialData);
    const { user, anuncios, activityLogs, stats, availableRoles } = userData;
    const [activeTab, setActiveTab] = useState('anuncios');
    const [announcementsList, setAnnouncementsList] = useState(anuncios);
    const [suspensionModal, setSuspensionModal] = useState({ isOpen: false, anuncio: null });
    const [announcementFilter, setAnnouncementFilter] = useState('all');

    const handleModerateAnnouncement = async (anuncio, newStatus, reason = '') => {
        if (newStatus === 'SUSPENSO' && !reason) {
            setSuspensionModal({ isOpen: true, anuncio });
            return;
        }
        
        const promise = fetch(`/api/admin/anuncios/${anuncio.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: anuncio.type, status: newStatus, reason }),
        });

        toast.promise(promise, {
            loading: 'A processar...',
            success: async (res) => {
                if (!res.ok) throw new Error('Falha na operação.');
                const updatedAd = await res.json();
                setAnnouncementsList(currentList => 
                    currentList.map(ad => 
                        ad.id === anuncio.id && ad.type === anuncio.type ? { ...ad, status: updatedAd.status, suspensionReason: updatedAd.suspensionReason } : ad
                    )
                );
                setSuspensionModal({ isOpen: false, anuncio: null });
                return 'Anúncio atualizado com sucesso!';
            },
            error: 'Ocorreu um erro.',
        });
    };
    
    const handleDelete = async (anuncio) => {
        if (!window.confirm(`Tem a certeza que quer apagar o anúncio "${anuncio.nome || anuncio.titulo}"?`)) return;
        const promise = fetch(`/api/admin/anuncios/${anuncio.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: anuncio.type }),
        });
        toast.promise(promise, {
            loading: 'A apagar...',
            success: async (res) => {
                if (!res.ok) throw new Error('Falha ao apagar.');
                const deletedAd = await res.json();
                setAnnouncementsList(currentList => 
                    currentList.map(ad => 
                        ad.id === anuncio.id && ad.type === anuncio.type ? { ...ad, deletedAt: deletedAd.deletedAt } : ad
                    )
                );
                return 'Anúncio apagado com sucesso!';
            },
            error: 'Ocorreu um erro.',
        });
    };

    const handleFilterClick = (filter) => {
        setAnnouncementFilter(filter);
        setActiveTab('anuncios');
    };

    const filteredAnnouncements = announcementsList.filter(ad => {
        if (announcementFilter === 'all') return true;
        if (announcementFilter === 'deleted') return !!ad.deletedAt;
        if (announcementFilter === 'active') return ad.status === 'ATIVO' && !ad.deletedAt;
        if (announcementFilter === 'paused') return ad.status === 'PAUSADO' && !ad.deletedAt;
        if (announcementFilter === 'suspended') return ad.status === 'SUSPENSO' && !ad.deletedAt;
        return true;
    });

    const TabButton = ({ id, label, iconName, count }) => {
        const Icon = SolidIcons[iconName];
        if (!Icon) return null;
        return (
            <button
                onClick={() => setActiveTab(id)}
                className={`flex items-center px-3 py-2 font-medium text-sm rounded-md ${activeTab === id ? 'bg-yellow-100 text-yellow-800' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <Icon className="h-5 w-5 mr-2" />
                {label} 
                {count !== undefined && <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">{count}</span>}
            </button>
        );
    };
    
    const { display: phoneDisplay, link: phoneLink } = formatPhoneNumber(user.phone);

    return (
        <div>
            <Toaster position="top-right" />
            {suspensionModal.isOpen && (
                <SuspensionModal 
                    anuncio={suspensionModal.anuncio}
                    onClose={() => setSuspensionModal({ isOpen: false, anuncio: null })}
                    onConfirm={(reason) => handleModerateAnnouncement(suspensionModal.anuncio, 'SUSPENSO', reason)}
                />
            )}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border">
                <div className="flex items-center space-x-3">
                    <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                    {user.isVerified && (
                        <span className="flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            <SolidIcons.CheckBadgeIcon className="h-4 w-4 mr-1" />
                            Verificado
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-4 mt-1">
                    <p className="text-gray-600">{user.email}</p>
                    <span className="text-gray-300">|</span>
                    <a href={phoneLink} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-yellow-600 flex items-center">
                        <SolidIcons.PhoneIcon className="h-4 w-4 mr-2" /> {phoneDisplay}
                    </a>
                </div>
                <p className="text-sm text-gray-500 mt-2">Registado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                <StatCard title="Total de Anúncios" value={stats.total} iconName="ListBulletIcon" onClick={() => handleFilterClick('all')} isActive={announcementFilter === 'all'} />
                <StatCard title="Ativos" value={stats.active} iconName="PlayIcon" onClick={() => handleFilterClick('active')} isActive={announcementFilter === 'active'} />
                <StatCard title="Pausados" value={stats.paused} iconName="PauseIcon" onClick={() => handleFilterClick('paused')} isActive={announcementFilter === 'paused'} />
                <StatCard title="Suspensos" value={stats.suspended} iconName="ShieldExclamationIcon" onClick={() => handleFilterClick('suspended')} isActive={announcementFilter === 'suspended'} />
                <StatCard title="Excluídos" value={stats.deleted} iconName="TrashIcon" onClick={() => handleFilterClick('deleted')} isActive={announcementFilter === 'deleted'} />
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <TabButton id="anuncios" label="Anúncios" iconName="TractorIcon" count={filteredAnnouncements.length} />
                    <TabButton id="logs" label="Atividades" iconName="ClockIcon" count={activityLogs.length} />
                    <TabButton id="edit" label="Editar Perfil" iconName="PencilSquareIcon" />
                </nav>
            </div>

            <div className="mt-8">
                {activeTab === 'anuncios' && (
                     <div className="bg-white p-6 rounded-lg shadow-sm border">
                         <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Anúncio</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredAnnouncements.map((ad) => (
                                        <tr key={`${ad.type}-${ad.id}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="font-medium text-gray-900">{ad.nome || ad.titulo}</p>
                                                <p className="text-sm text-gray-500 capitalize">{ad.type}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={ad.status} deletedAt={ad.deletedAt} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-3">
                                                    {ad.deletedAt ? (
                                                        <p className="text-xs text-red-600">Apagado</p>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => handleModerateAnnouncement(ad, ad.status === 'ATIVO' ? 'PAUSADO' : 'ATIVO')} title={ad.status === 'ATIVO' ? 'Pausar' : 'Reativar'}>
                                                                {ad.status === 'ATIVO' ? <SolidIcons.PauseIcon className="h-5 w-5 text-gray-400 hover:text-yellow-600" /> : <SolidIcons.PlayIcon className="h-5 w-5 text-gray-400 hover:text-green-600" />}
                                                            </button>
                                                            <button onClick={() => handleModerateAnnouncement(ad, 'SUSPENSO')} title="Suspender">
                                                                <SolidIcons.ShieldExclamationIcon className="h-5 w-5 text-gray-400 hover:text-orange-600" />
                                                            </button>
                                                            <Link href={`/admin/anuncios/${ad.type}/${ad.id}/edit`} title="Editar">
                                                                <SolidIcons.PencilSquareIcon className="h-5 w-5 text-gray-400 hover:text-gray-800" />
                                                            </Link>
                                                            <button onClick={() => handleDelete(ad)} title="Apagar">
                                                                <SolidIcons.TrashIcon className="h-5 w-5 text-gray-400 hover:text-red-600" />
                                                            </button>
                                                        </>
                                                    )}
                                                     <Link href={`/anuncio/${ad.type}/${ad.slug}`} target="_blank" title="Ver Anúncio">
                                                        <SolidIcons.EyeIcon className="h-5 w-5 text-gray-400 hover:text-indigo-600" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                    </div>
                )}
                {activeTab === 'logs' && (
                     <div className="space-y-4">
                        {activityLogs.length > 0 ? 
                            activityLogs.map(log => <LogEntry key={log.id} log={log} />) : 
                            <p>Não há registo de atividades.</p>}
                    </div>
                )}
                {activeTab === 'edit' && (
                    <EditUserForm 
                        user={user} 
                        availableRoles={availableRoles}
                        onUpdate={(updatedUser) => setUserData(prev => ({ ...prev, user: updatedUser }))}
                    />
                )}
            </div>
        </div>
    );
}

