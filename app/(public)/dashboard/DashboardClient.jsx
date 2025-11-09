'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatNumber } from '@/lib/formatters';
// import { MailIcon } from '@heroicons/react/24/solid'; // Temporariamente removido para depuração

// Labels para os filtros dos alertas de busca
const filterLabels = {
    search: 'Busca',
    tipo: 'Tipo',
    marca: 'Marca',
    estado: 'Estado',
    cidade: 'Cidade',
    preco_min: 'Preço Mín.',
    preco_max: 'Preço Máx.',
    ano_min: 'Ano De',
    ano_max: 'Ano Até',
    horas_min: 'Horas Mín.',
    horas_max: 'Horas Máx.',
    category: 'Categoria'
};

// Componente reutilizável para a linha de um anúncio
const AnuncioRow = ({ anuncio, type, onToggleStatus, onDelete }) => {
    const isSuspenso = anuncio.status === 'SUSPENSO';
    const editRoute = `/anuncio/${type}/${anuncio.slug}/edit`;
    const viewRoute = `/anuncio/${type}/${anuncio.slug}`;
    
    const imageUrl = anuncio.imagens && anuncio.imagens.length > 0
      ? (anuncio.imagens[0].thumbnailUrl || anuncio.imagens[0].url)
      : 'https://placehold.co/100x100/e2e8f0/333?text=Sem+Foto';

    return (
        <div className={`p-4 rounded-lg flex flex-col gap-4 border ${isSuspenso || anuncio.status === 'PAUSADO' ? 'bg-gray-50' : 'bg-white'}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center w-full sm:w-auto flex-grow">
                    <img 
                        src={imageUrl} 
                        alt={anuncio.nome || anuncio.titulo} 
                        className="w-24 h-24 object-cover rounded-md flex-shrink-0"
                    />
                    <div className="ml-4">
                        <div className="text-lg font-bold text-gray-900">{anuncio.nome || anuncio.titulo}</div>
                        <div className="text-sm text-gray-500">{type === 'maquina' ? `${anuncio.marca} | ${anuncio.tipo}`: `${formatNumber(anuncio.area_total_hectares)} ha`}</div>
                        <div className="text-sm text-gray-500">{anuncio.cidade}, {anuncio.estado}</div>
                        <div className="text-base font-semibold text-gray-800 mt-1">{formatCurrency(anuncio.preco)}</div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-end gap-4 w-full sm:w-auto">
                    <span className={`px-3 py-1 text-xs leading-5 font-semibold rounded-full ${
                        isSuspenso ? 'bg-red-100 text-red-800' : 
                        anuncio.status === 'ATIVO' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                        {anuncio.status}
                    </span>
                    <div className="flex flex-wrap gap-2 justify-end">
                        <Link href="#" className="text-sm text-white bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-md font-semibold">PROMOVER</Link>
                        <Link href={viewRoute} className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 bg-gray-100 rounded-md font-semibold">VISUALIZAR</Link>
                        <button 
                            onClick={() => onToggleStatus(anuncio, type)} 
                            disabled={isSuspenso}
                            title={isSuspenso ? 'Contacte o suporte para reativar' : (anuncio.status === 'ATIVO' ? 'Pausar' : 'Reativar')}
                            className={`text-sm px-3 py-2 rounded-md font-semibold ${isSuspenso ? 'cursor-not-allowed text-gray-500' : (anuncio.status === 'ATIVO' ? 'text-yellow-800 hover:bg-yellow-100' : 'text-green-800 hover:bg-green-100')}`}
                        >
                            {anuncio.status === 'ATIVO' ? 'PAUSAR' : 'REATIVAR'}
                        </button>
                        <Link href={editRoute} className="text-sm text-indigo-600 hover:text-indigo-900 px-3 py-2 font-semibold">EDITAR</Link>
                        <button onClick={() => onDelete(anuncio, type)} className="text-sm text-red-600 hover:text-red-900 px-3 py-2 font-semibold">APAGAR</button>
                    </div>
                </div>
            </div>
            {/* --- Bloco de aviso para anúncios suspensos --- */}
            {isSuspenso && (
                <div className="mt-2 p-3 bg-red-50 border-l-4 border-red-400 text-sm text-red-700">
                    <p className="font-bold">Este anúncio foi suspenso pela moderação.</p>
                    <p className="mt-1">Motivo: {anuncio.suspensionReason || 'Não foi fornecido um motivo específico.'}</p>
                    {/* --- CORREÇÃO: Ícone substituído por emoji para depuração --- */}
                    <a href={`mailto:suporte@agromaq.com?subject=Suporte para o anúncio: ${anuncio.nome || anuncio.titulo}`} className="mt-2 inline-flex items-center gap-2 text-red-800 font-semibold hover:underline">
                        <span role="img" aria-label="email">📧</span> Entrar em contato com o Suporte
                    </a>
                </div>
            )}
        </div>
    );
};


export default function DashboardClient({ initialMaquinas, initialFazendas, initialAlertas }) {
    const [maquinas, setMaquinas] = useState(initialMaquinas);
    const [fazendas, setFazendas] = useState(initialFazendas);
    const [alertas, setAlertas] = useState(initialAlertas);
    const router = useRouter();

    const handleToggleStatus = async (anuncio, type) => {
        try {
            const response = await fetch(`/api/anuncios/${type}s/${anuncio.slug}/status`, {
                method: 'PATCH',
            });
            const updatedAnuncio = await response.json();
            if (response.ok) {
                const updateList = (prevList) => prevList.map(item => item.id === anuncio.id ? { ...item, status: updatedAnuncio.status } : item);
                if (type === 'maquina') {
                    setMaquinas(updateList);
                } else {
                    setFazendas(updateList);
                }
            } else {
                alert(`Erro: ${updatedAnuncio.error}`);
            }
        } catch (error) {
            alert('Não foi possível conectar ao servidor.');
        }
    };

    const handleDelete = async (anuncio, type) => {
        if (confirm('Tem a certeza que deseja apagar este anúncio?')) {
            try {
                const response = await fetch(`/api/anuncios/${type}s/${anuncio.slug}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    const removeFromList = (prevList) => prevList.filter(item => item.id !== anuncio.id);
                    if (type === 'maquina') {
                        setMaquinas(removeFromList);
                    } else {
                        setFazendas(removeFromList);
                    }
                } else {
                    const result = await response.json();
                    alert(`Erro: ${result.error}`);
                }
            } catch (error) {
                alert('Não foi possível conectar ao servidor.');
            }
        }
    };
    
    const handleDeleteAlerta = async (id) => {
        if (confirm('Tem a certeza de que quer apagar este alerta de busca?')) {
             try {
                const response = await fetch(`/api/alertas/${id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    setAlertas(prev => prev.filter(alerta => alerta.id !== id));
                } else {
                    const result = await response.json();
                    alert(`Erro: ${result.error}`);
                }
            } catch (error) {
                alert('Não foi possível conectar ao servidor.');
            }
        }
    };

    return (
        <div className="py-12">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">O Meu Painel</h1>
                    <Link href="/anunciar" className="bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition duration-300 shadow-sm text-lg">
                        + Criar Novo Anúncio
                    </Link>
                </div>

                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">
                        <h3 className="text-xl font-medium mb-4">Meus Anúncios de Máquinas</h3>
                        {maquinas.length === 0 ? (
                            <p className="text-gray-600">Você ainda não tem nenhum anúncio de máquina.</p>
                        ) : (
                            <div className="space-y-4">
                                {maquinas.map((maquina) => <AnuncioRow key={maquina.id} anuncio={maquina} type="maquina" onToggleStatus={handleToggleStatus} onDelete={handleDelete} />)}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">
                        <h3 className="text-xl font-medium mb-4">Meus Anúncios de Fazendas</h3>
                        {fazendas.length === 0 ? (
                            <p className="text-gray-600">Você ainda não tem nenhum anúncio de fazenda.</p>
                        ) : (
                            <div className="space-y-4">
                                {fazendas.map((fazenda) => <AnuncioRow key={fazenda.id} anuncio={fazenda} type="fazenda" onToggleStatus={handleToggleStatus} onDelete={handleDelete} />)}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">
                        <h3 className="text-xl font-medium mb-4">Meus Alertas de Busca</h3>
                        {alertas.length === 0 ? (
                            <p className="text-gray-600">Você ainda não tem nenhuma busca guardada.</p>
                        ) : (
                            <ul className="space-y-3">
                                {alertas.map(alerta => (
                                    <li key={alerta.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border flex-wrap gap-4">
                                        <div>
                                            <p className="font-bold text-gray-800">{alerta.nome}</p>
                                            <div className="text-sm text-gray-700 space-x-2 flex-wrap">
                                                {Object.entries(alerta.filtros).filter(([, value]) => value).map(([key, value], index, arr) => (
                                                    <span key={key}>
                                                        <strong className="font-semibold text-gray-900">{filterLabels[key] || key}:</strong>
                                                        <span className="text-gray-600"> {String(value)}</span>
                                                        {index < arr.length - 1 && <span className="text-gray-300 mx-1">|</span>}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteAlerta(alerta.id)}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium hover:bg-red-100 rounded-full p-2 transition-colors"
                                            title="Apagar Alerta"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

