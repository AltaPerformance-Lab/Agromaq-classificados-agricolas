'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon, PlayIcon, PauseIcon, TrashIcon, PencilIcon, ShieldExclamationIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/solid';
import toast, { Toaster } from 'react-hot-toast';
import { ModerationModal } from '../../../components/admin/ModerationModal';

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
    return <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses}`}>{text}</span>;
};

const Paginator = ({ currentPage, totalPages }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    const createPageUrl = (page) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        return `/admin/anuncios?${params.toString()}`;
    };

    return (
        <nav className="flex items-center justify-center space-x-2">
            {pages.map(page => (
                <Link key={page} href={createPageUrl(page)} className={`px-4 py-2 rounded-md text-sm font-medium ${currentPage === page ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                    {page}
                </Link>
            ))}
        </nav>
    );
};

export default function AnunciosClient({ initialAnuncios, totalPages, currentPage, showDeleted: initialShowDeleted }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [anuncios, setAnuncios] = useState(initialAnuncios);
    const [modalState, setModalState] = useState({ isOpen: false, anuncio: null, action: 'suspend' });
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleted, setShowDeleted] = useState(initialShowDeleted);

    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        if (search) {
            params.set('search', search);
        } else {
            params.delete('search');
        }
        if (showDeleted) {
            params.set('deleted', 'true');
        } else {
            params.delete('deleted');
        }
        params.set('page', '1');
        router.push(`/admin/anuncios?${params.toString()}`);
    }, [search, showDeleted, router]);

    const openModal = (anuncio, action) => setModalState({ isOpen: true, anuncio, action });
    const closeModal = () => setModalState({ isOpen: false, anuncio: null, action: 'suspend' });

    const handleApiCall = (promise, loadingMsg, successMsg, errorMsg, updateFunction) => {
        toast.promise(promise, {
            loading: loadingMsg,
            success: async (res) => {
                if (!res.ok) {
                     const errorData = await res.json().catch(() => ({ error: errorMsg }));
                     throw new Error(errorData.error || errorMsg);
                }
                const data = await res.json();
                updateFunction(data);
                return successMsg;
            },
            error: (err) => err.message || errorMsg,
        });
    };

    const handleStatusChange = (anuncio, newStatus) => {
        const promise = fetch(`/api/admin/anuncios/${anuncio.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: anuncio.type, status: newStatus }),
        });
        handleApiCall(promise, 'A atualizar status...', 'Status atualizado!', 'Falha ao atualizar.', (updatedAd) => {
            setAnuncios(current => current.map(ad => ad.id === anuncio.id && ad.type === anuncio.type ? { ...ad, status: updatedAd.status } : ad));
        });
    };
    
    const handleConfirmSuspension = (reason) => {
        setIsLoading(true);
        const { anuncio } = modalState;
        const promise = fetch(`/api/admin/anuncios/${anuncio.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: anuncio.type, status: 'SUSPENSO', reason }),
        });
        handleApiCall(promise, 'A suspender...', 'Anúncio suspenso!', 'Falha ao suspender.', (updatedAd) => {
            setAnuncios(current => current.map(ad => ad.id === anuncio.id && ad.type === anuncio.type ? { ...ad, status: updatedAd.status, suspensionReason: updatedAd.suspensionReason } : ad));
            closeModal();
        });
        promise.finally(() => setIsLoading(false));
    };

    const handleDelete = (anuncio) => {
        if (!window.confirm(`Tem a certeza que quer apagar o anúncio "${anuncio.nome || anuncio.titulo}"?`)) return;
        const promise = fetch(`/api/admin/anuncios/${anuncio.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: anuncio.type }),
        });
        handleApiCall(promise, 'A apagar...', 'Anúncio apagado!', 'Falha ao apagar.', () => {
             setAnuncios(current => current.filter(ad => !(ad.id === anuncio.id && ad.type === anuncio.type)));
        });
    };

    const handleRestore = (anuncio) => {
        const promise = fetch(`/api/admin/anuncios/${anuncio.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: anuncio.type, restore: true }),
        });
        handleApiCall(promise, 'A restaurar...', 'Anúncio restaurado!', 'Falha ao restaurar.', () => {
            setAnuncios(current => current.filter(ad => !(ad.id === anuncio.id && ad.type === anuncio.type)));
        });
    };

    return (
        <div>
            <Toaster position="top-right" />
            <ModerationModal {...modalState} onClose={closeModal} onConfirm={handleConfirmSuspension} isLoading={isLoading} />
            <div className="mb-4 flex justify-between items-center">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Pesquisar por título, tipo, marca ou email..."
                    className="w-full md:w-2/3 lg:w-1/2 p-3 border border-gray-300 rounded-lg"
                />
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} className="rounded" />
                    <span className="text-sm font-medium text-gray-700">Mostrar excluídos</span>
                </label>
            </div>
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Anúncio</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilizador</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {anuncios.map((ad) => (
                                <tr key={`${ad.type}-${ad.id}`} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        {/* --- ATUALIZAÇÃO: O nome do anúncio agora é um link --- */}
                                        <Link href={`/anuncio/${ad.type}/${ad.slug}`} target="_blank" className="font-medium text-gray-900 hover:text-yellow-600 transition-colors">
                                            {ad.nome || ad.titulo}
                                        </Link>
                                        <p className="text-sm text-gray-500 capitalize">{ad.type}</p>
                                        {ad.status === 'SUSPENSO' && ad.suspensionReason && (
                                            <p className="text-xs text-orange-600 mt-1" title={ad.suspensionReason}>
                                                <span className="font-semibold">Motivo:</span> {ad.suspensionReason.substring(0, 40)}{ad.suspensionReason.length > 40 ? '...' : ''}
                                            </p>
                                        )}
                                        {ad.deletedAt && (
                                            <p className="text-xs text-red-600 mt-1">
                                                Excluído em: {new Date(ad.deletedAt).toLocaleDateString('pt-BR')}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{ad.user?.name || 'N/A'}</td>
                                    <td className="px-6 py-4"><StatusBadge status={ad.status} deletedAt={ad.deletedAt} /></td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-3">
                                            {ad.deletedAt ? (
                                                <button onClick={() => handleRestore(ad)} title="Restaurar"><ArrowUturnLeftIcon className="h-5 w-5 text-gray-400 hover:text-blue-600" /></button>
                                            ) : (
                                                <>
                                                    {ad.status === 'ATIVO' && <button onClick={() => handleStatusChange(ad, 'PAUSADO')} title="Pausar"><PauseIcon className="h-5 w-5 text-gray-400 hover:text-yellow-600" /></button>}
                                                    {(ad.status === 'PAUSADO' || ad.status === 'SUSPENSO') && <button onClick={() => handleStatusChange(ad, 'ATIVO')} title="Reativar"><PlayIcon className="h-5 w-5 text-gray-400 hover:text-green-600" /></button>}
                                                    {ad.status !== 'SUSPENSO' && <button onClick={() => openModal(ad, 'suspend')} title="Suspender"><ShieldExclamationIcon className="h-5 w-5 text-gray-400 hover:text-orange-600" /></button>}
                                                    
                                                    {/* --- ATUALIZAÇÃO: O ícone de visualização foi removido daqui --- */}

                                                    <Link href={`/admin/anuncios/${ad.type}/${ad.id}/edit`} title="Editar" className="p-1 rounded-full text-gray-400 hover:bg-gray-200">
                                                        <PencilIcon className="h-5 w-5 hover:text-gray-800" />
                                                    </Link>
                                                    <button onClick={() => handleDelete(ad)} title="Apagar" className="p-1 rounded-full text-gray-400 hover:bg-gray-200">
                                                        <TrashIcon className="h-5 w-5 hover:text-red-600" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && <div className="p-4"><Paginator currentPage={currentPage} totalPages={totalPages} /></div>}
            </div>
        </div>
    );
}

